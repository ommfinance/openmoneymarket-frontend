import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";
import {Modals} from "../../models/Modals";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {ActiveModalChange} from "../../models/ActiveModalChange";
import {Asset} from "../../models/Asset";
import {BaseClass} from "../base-class";
import {BORROW, REPAY, SUPPLY, WITHDRAW} from "../../common/constants";


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
  activeAsset?: Asset;
  activeModalType?: Modals;


  constructor(private modalService: ModalService,
              private iconexApiService: IconexApiService,
              private bridgeWidgetService: BridgeWidgetService) {
    super();
    this.activeModalSubscription = this.modalService.activeModalChange$.subscribe((activeModalChange: ActiveModalChange) => {
      switch (activeModalChange.modalType) {
        case Modals.SIGN_IN:
          this.activeModal = this.signInModal.nativeElement;
          this.activeAsset = undefined;
          break;
        default:
          this.activeModal = this.assetActionModal.nativeElement;
          this.activeAsset = activeModalChange.asset;
          this.activeModalType = activeModalChange.modalType;
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
    return this.activeModalType === Modals.BORROW;
  }

  getModalActionName(): string {
    switch (this.activeModalType) {
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

}
