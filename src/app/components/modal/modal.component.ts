import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";
import {Modals} from "../../models/Modals";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {ModalAction} from "../../models/ModalAction";
import {BaseClass} from "../base-class";
import {BORROW, REPAY, SUPPLY, WITHDRAW} from "../../common/constants";
import {SupplyService} from "../../services/supply/supply.service";
import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {RepayService} from "../../services/repay/repay.service";
import {OmmError} from "../../core/errors/OmmError";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {NotificationService} from "../../services/notification/notification.service";


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent extends BaseClass implements OnInit {

  @ViewChild('signInModal', { static: true }) signInModal!: ElementRef;
  @ViewChild('assetActionModal', { static: true }) assetActionModal!: ElementRef;

  activeModalSubscription: Subscription;
  activeModal?: HTMLElement;
  activeModalChange?: ModalAction;


  constructor(private modalService: ModalService,
              private iconexApiService: IconexApiService,
              private bridgeWidgetService: BridgeWidgetService,
              private supplyService: SupplyService,
              private withdrawService: WithdrawService,
              private borrowService: BorrowService,
              private repayService: RepayService,
              private localStorageService: LocalStorageService,
              private stateChangeService: StateChangeService,
              private notificationService: NotificationService) {
    super();
    this.activeModalSubscription = this.modalService.activeModalChange$.subscribe((activeModalChange: ModalAction) => {
      switch (activeModalChange.modalType) {
        case Modals.SIGN_IN:
          this.activeModal = this.signInModal.nativeElement;
          break;
        default:
          this.activeModal = this.assetActionModal.nativeElement;
          this.activeModalChange = activeModalChange;
      }
      this.modalService.showModal(this.activeModal);
    });
  }

  ngOnInit(): void {
  }

  onSignInIconexClick(): void {
    this.modalService.hideActiveModal();
    this.iconexApiService.hasAccount();
  }

  onSignInBridgeClick(): void {
    this.modalService.hideActiveModal();
    this.bridgeWidgetService.openBridgeWidget();
  }

  onCancelClick(): void {
    this.modalService.hideActiveModal();
  }

  isBorrowModal(): boolean {
    return this.activeModalChange?.modalType === Modals.BORROW;
  }

  getModalActionName(): string {
    switch (this.activeModalChange?.modalType) {
      case Modals.BORROW:
        return BORROW;
      case Modals.SUPPLY:
        return SUPPLY;
      case Modals.REPAY:
        return REPAY;
      case Modals.WITHDRAW:
        return WITHDRAW;
      default:
        return "";
    }
  }

  getBeforeAfterDiff(): number {
    return Math.abs((this.activeModalChange?.assetAction?.before ?? 0) -
      (this.activeModalChange?.assetAction?.after ?? 0));
  }

  onAssetModalActionClick(): void {
    // store asset-user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);
    const assetTag = this.activeModalChange!.assetAction!.asset.tag;
    switch (this.activeModalChange?.modalType) {
      case Modals.BORROW:
        this.borrowService.borrowAsset(this.activeModalChange!.assetAction!.amount, assetTag);
        this.notificationService.showNewNotification(`Committing borrow ${assetTag} transaction...`);
        break;
      case Modals.SUPPLY:
        this.supplyService.supplyAsset(this.activeModalChange!.assetAction!.amount, assetTag);
        this.notificationService.showNewNotification(`Committing supply ${assetTag} transaction...`);
        break;
      case Modals.REPAY:
        this.repayService.repayAsset(this.activeModalChange!.assetAction!.amount, assetTag);
        this.notificationService.showNewNotification(`Committing repay ${assetTag} transaction...`);
        break;
      case Modals.WITHDRAW:
        this.withdrawService.withdrawAsset(this.activeModalChange!.assetAction!.amount, assetTag);
        this.notificationService.showNewNotification(`Committing withdraw ${assetTag} transaction...`);
        break;
      default:
        throw new OmmError(`Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange);

    // hide current modal
    this.modalService.hideActiveModal();
  }

}
