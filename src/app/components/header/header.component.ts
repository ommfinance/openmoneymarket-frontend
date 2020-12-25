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
              private modalService: ModalService) {
    super();
    const bridge = new BridgeService("https://bicon.net.solidwallet.io/api/v3");

    log.debug("BridgeService instance = ", bridge);
  }

  ngOnInit(): void {
  }

  onSignInClick(): void {
    this.modalService.showNewModal(Modals.SIGN_IN);
  }

  onLoginIconexClick(): void {
    this.iconexApiService.hasAccount();
  }

  onProfileClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').toggleClass("active");
    $('.profile').toggleClass("active");
  }

  onMainClick(): void {
    $('#profile-tooltip').removeClass("active");
    $('.profile').removeClass("active");
  }

  onOpenBridgeClick(): void {
    // TODO open Bridge modal!
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
