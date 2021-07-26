import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {UserPoolData} from "../../models/UserPoolData";
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import {StakingAction} from "../../models/StakingAction";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Utils} from "../../common/utils";
import {NotificationService} from "../../services/notification/notification.service";
import {ModalAction} from "../../models/ModalAction";

declare var noUiSlider: any;

@Component({
  selector: 'app-pool-stake-slider',
  templateUrl: './pool-stake-slider.component.html',
  styleUrls: ['./pool-stake-slider.component.css']
})
export class PoolStakeSliderComponent extends BaseClass implements OnInit, AfterViewInit {

  sliderEl: any;
  @ViewChild("slider")set a(a: ElementRef) {this.sliderEl = a.nativeElement; }
  adjustStateEl: any;
  @ViewChild("adjustEl")set b(b: ElementRef) {this.adjustStateEl = b.nativeElement; }
  restStateEl: any;
  @ViewChild("restEl")set c(c: ElementRef) {this.restStateEl = c.nativeElement; }
  inputStakedEl: any;
  @ViewChild("inputEl")set d(d: ElementRef) {this.inputStakedEl = d.nativeElement; }

  poolData: UserPoolData | undefined;

  @Input() set poolId(id: number) {
    this.poolData = this.persistenceService.userPoolsDataMap.get(id);

    // do something on 'poolData' change TODO

  }

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private notificationService: NotificationService,
              private cd: ChangeDetectorRef) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initSlider();
    this.setCurrentStaked();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  onConfirmClick(): void {
    const before = this.roundDownTo2Decimals(this.persistenceService.getUserPoolStakedBalance(this.poolId));
    const after = this.roundDownTo2Decimals(this.inputStakedEl.value);
    const diff = Utils.subtractDecimalsWithPrecision(after, before, 0);

    // if before and after equal show notification
    if (before === after) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const stakingAction = new StakingAction(before, after, Math.abs(diff), this.poolId);

    if (diff > 0) {
      this.modalService.showNewModal(ModalType.POOL_STAKE, undefined, stakingAction);
    } else {
      this.modalService.showNewModal(ModalType.POOL_UNSTAKE, undefined, stakingAction);
    }
  }

  registerSubscriptions(): void {
    this.subscribeToUserPoolsChange();
    this.subscribeToUserModalActionChange();
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.onCancelClick();
    });
  }

  subscribeToUserPoolsChange(): void {
    this.stateChangeService.userPoolsDataChange$.toPromise().then(() => {
      this.initSlider();
      this.setCurrentStaked();
    });
  }

  setCurrentStaked(value?: number): void {
    value = value ? value : (this.persistenceService.userPoolsDataMap.get(this.poolId)?.userStakedBalance ?? 0);

    // update slider value
    if (this.sliderEl?.noUiSlider) {
      this.setStakeSliderValue(this.inputStakedEl.value);
    } else {
      this.inputStakedEl.value = value;
    }
  }

  private setStakeSliderValue(value: number): void {
    const res = this.roundDownTo2Decimals(value);

    // if value is greater than slider max, update the sliders max and set the value
    if (res > this.sliderMaxValue()) {
      this.sliderEl.noUiSlider.updateOptions({range: { min: 0, max: res }});
      this.sliderEl.noUiSlider.set(res);
    }

    this.sliderEl.noUiSlider.set(res);
  }

  initSlider(): void {
    const userStakedBalance = this.poolData?.userStakedBalance ?? 0;
    const max = this.getStakeMax();
    // Stake slider
    noUiSlider.create(this.sliderEl, {
      start: [this.poolData?.userStakedBalance ?? 0],
      padding: [0],
      connect: 'lower',
      range: {
        min: [0],
        max: [max === 0 ? 1 : max]
      },
    });

    // On stake slider update
    this.sliderEl?.noUiSlider.on('update', (values: any, handle: any) => {
      this.inputStakedEl.value = this.roundDownTo2Decimals(+values[handle]);
    });
  }

  onAdjustClick(): void {
    this.sliderEl?.removeAttribute("disabled");
    this.addClass(this.restStateEl, "hide");
    this.removeClass(this.adjustStateEl, "hide");
  }

  onCancelClick(): void {
    this.sliderEl?.setAttribute("disabled", "");
    this.addClass(this.adjustStateEl, "hide");
    this.removeClass(this.restStateEl, "hide");
  }

  sliderMaxValue(): number {
    return this.sliderEl?.noUiSlider?.options.range.max ?? 1;
  }

  getStakeMax(): number {
    // sliders max is sum of staked + available balance
    return this.roundDownTo2Decimals(Utils.addDecimalsPrecision(this.persistenceService.getUserPoolStakedBalance(this.poolId),
      this.persistenceService.getUserPoolStakedAvailableBalance(this.poolId)));
  }

  getStakedValue(): number {
    return this.inputStakedEl?.value ?? 0;
  }
}
