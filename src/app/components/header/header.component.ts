import {Component, Input, OnInit} from '@angular/core';
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {SupplyService} from "../../services/supply/supply.service";
// @ts-ignore
import {BaseClass} from "../base-class";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {ModalService} from "../../services/modal/modal.service";
import {ModalType} from "../../models/ModalType";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";
import {NotificationService} from "../../services/notification/notification.service";
import {NavigationEnd, Router} from "@angular/router";

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent extends BaseClass implements OnInit {

  @Input() walletValue!: string;

  pageTitle = "Home";

  constructor(public persistenceService: PersistenceService,
              public depositService: SupplyService,
              public iconexApiService: IconexApiService,
              private modalService: ModalService,
              private bridgeWidgetService: BridgeWidgetService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              private router: Router) {
    super(persistenceService);
    router.events.subscribe( (event) => ( event instanceof NavigationEnd ) && this.handleRouteChange() );
  }

  handleRouteChange(): void {
    if (this.router.url.includes('vote')) {
      this.pageTitle = "Vote";
    } else {
      this.pageTitle = "Home";
    }
  }

  ngOnInit(): void {
  }

  onSignInClick(): void {
    this.modalService.showNewModal(ModalType.SIGN_IN);
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
    // if Bridge wallet commit request to Bridge to sign out
    if (this.persistenceService.bridgeWalletActive()) {
      this.bridgeWidgetService.signOutUser();
    }

    this.dataLoaderService.walletLogout();
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

  onCopyIconAddressClick(): void {
    const textArea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = "0";
    textArea.style.left = "0";

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = "0";

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';
    textArea.value = this.persistenceService.publicGetActiveIconAddress() ?? "";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';

      if (msg !== "successful" || !textArea.value) {
        this.notificationService.showNewNotification('Oops, unable to copy');
      } else {
        // show notification
        this.notificationService.showNewNotification("Address copied!");
      }
    } catch (err) {
      this.notificationService.showNewNotification('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
  }
}
