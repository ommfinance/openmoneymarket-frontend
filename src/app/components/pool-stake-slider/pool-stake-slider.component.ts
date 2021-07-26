import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {UserPoolData} from "../../models/UserPoolData";
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import {StakingAction} from "../../models/StakingAction";

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
  inputEl: any;
  @ViewChild("inputEl")set d(d: ElementRef) {this.inputEl = d.nativeElement; }

  poolData: UserPoolData | undefined;

  currentStaked = 0;

  @Input() set poolId(id: number) {
    this.poolData = this.persistenceService.userPoolsDataMap.get(id);

    // do something on 'poolData' change TODO

  }

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService) {
    super(persistenceService);
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.initSlider();
  }

  initSlider(): void {
    // Stake slider
    noUiSlider.create(this.sliderEl, {
      start: [this.poolData?.userStakedBalance ?? 0],
      padding: [0],
      connect: 'lower',
      range: {
        min: [0],
        max: [this.poolData?.userTotalBalance ?? 1]
      },
    });

    // On stake slider update
    this.sliderEl?.noUiSlider.on('update', (values: any, handle: any) => {
      this.inputEl = this.roundDownTo2Decimals(+values[handle]);
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

  onConfirmClick(): void {
    this.modalService.showNewModal(ModalType.POOL_STAKE, undefined, new StakingAction(0, 150, 150));
  }
}
