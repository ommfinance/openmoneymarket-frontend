import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from './services/iconex-api/iconex-api.service';
import {DataLoaderService} from './services/data-loader/data-loader.service';
import {ModalService} from "./services/modal/modal.service";
import {PersistenceService} from "./services/persistence/persistence.service";
import {BaseClass} from "./components/base-class";
import {ReloaderService} from "./services/reloader/reloader.service";
import {WalletType} from "./models/wallets/Wallet";
import {LocalStorageService} from "./services/local-storage/local-storage.service";
import {IconexWallet} from "./models/wallets/IconexWallet";
import {LedgerWallet} from "./models/wallets/LedgerWallet";
import log from "loglevel";

declare var $: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseClass implements OnInit, OnDestroy {

  title = 'Open money market';

  private attachedListener: boolean;

  constructor(private iconexApiService: IconexApiService,
              private dataLoaderService: DataLoaderService,
              private modalService: ModalService,
              public persistenceService: PersistenceService,
              private reloaderService: ReloaderService,
              private localStorageService: LocalStorageService) {
    super(persistenceService);
    // register Iconex handler
    window.addEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
    this.attachedListener = true;

    // load all SCORE addresses
    dataLoaderService.loadAllScoreAddresses().then(() => {
      // load core data
      this.dataLoaderService.loadCoreData().then(() => {
        // after core data is logged try to re-login
        this.reLogin();
      });
    });


    // register on document click handler
    $(document).on("click", (e: any) => {
      if ($(e.target).is(".wallet.bridge") === false) {
        this.onBodyClick(e);
      }
    });
  }

  reLogin(): void {
    if (!this.persistenceService.userLoggedIn()) {
      const walletLogin: any = this.localStorageService.getLastWalletLogin();
      const timestamp = walletLogin.timestamp;

      log.debug(`reLogin walletLogin: ${walletLogin}`);

      // if last login was less than 1 hour ago 3600 do re-login
      const currentTimestamp = + new Date();
      if (timestamp > currentTimestamp - 3600000) {
        const activeWallet = walletLogin.wallet;
        const activeWalletType = activeWallet?.type;

        if (activeWallet &&  activeWalletType === WalletType.ICONEX || activeWalletType === WalletType.LEDGER) {
          switch (activeWalletType) {
            case WalletType.ICONEX:
              this.dataLoaderService.walletLogin(new IconexWallet(activeWallet.address));
              break;
            case WalletType.LEDGER:
              this.dataLoaderService.walletLogin(new LedgerWallet(activeWallet.address, activeWallet.path));
              break;
          }
        }
      }
    }
  }

  onBodyClick(e: any): void {
    $(".wallet.bridge").removeClass("active");
    $(".wallet-content.bridge").removeClass("active");
    e.stopPropagation();
  }

  ngOnInit(): void {
    if (!this.attachedListener){
      window.addEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
    }
  }

  ngOnDestroy(): void {
    if (this.attachedListener){
      window.removeEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
      this.attachedListener = true;
    }
  }

  onOverlayClick(): void {
    this.modalService.hideActiveModal();
  }



}
