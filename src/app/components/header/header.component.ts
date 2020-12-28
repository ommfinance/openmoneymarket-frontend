import {Component, Input, OnInit} from '@angular/core';
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {DepositService} from "../../services/deposit/deposit.service";
// @ts-ignore
import BridgeService from "icon-bridge-sdk/build/bridge.bundle";
import {BaseClass} from "../base-class";
import {IconexWallet} from "../../models/IconexWallet";
import {BridgeWallet} from "../../models/BridgeWallet";
import {ModalService} from "../../services/modal/modal.service";
import {Modals} from "../../models/Modals";
import log from "loglevel";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent extends BaseClass implements OnInit {

  @Input() walletValue!: string;

  constructor(public persistenceService: PersistenceService,
              public depositService: DepositService,
              public iconexApiService: IconexApiService,
              private modalService: ModalService,
              private bridgeWidgetService: BridgeWidgetService) {
    super();
  }

  ngOnInit(): void {
  }

  onSignInClick(): void {
    this.modalService.showNewModal(Modals.SIGN_IN);
  }

  onLoginIconexClick(): void {
    this.iconexApiService.hasAccount();
  }

  onWalletClick(e: any): void {
    $(".wallet.bridge").toggleClass("active");
    $(".wallet-content.bridge").toggleClass("active");
    e.stopPropagation();
  }

  onOpenBridgeClick(): void {
    this.bridgeWidgetService.openBridgeWidget();
  }

  onSignOutClick(): void {
    this.persistenceService.walletLogout();
  }
  // get Iconex wallet address or Bridge email
  getWalletId(): string {
    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      return this.persistenceService.activeWallet.address;
    }
    else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      return this.persistenceService.activeWallet.email;
    }
    else {
      return "";
    }
  }

  getWalletName(): string {
    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      return "Iconex wallet";
    }
    else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      return "Bridge wallet";
    }
    else {
      return "";
    }
  }

}
