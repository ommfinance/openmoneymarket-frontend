import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from './services/iconex-api/iconex-api.service';
import {DataLoaderService} from './services/data-loader/data-loader.service';
import {ModalService} from "./services/modal/modal.service";
import {PersistenceService} from "./services/persistence/persistence.service";
import {BaseClass} from "./components/base-class";
import {ReloaderService} from "./services/reloader/reloader.service";

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
              private reloaderService: ReloaderService) {
    super(persistenceService);
    // register Iconex handler
    window.addEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
    this.attachedListener = true;

    // load all SCORE addresses
    dataLoaderService.loadAllScoreAddresses().then(() => this.dataLoaderService.loadCoreData());


    // register on document click handler
    $(document).on("click", (e: any) => {
      if ($(e.target).is(".wallet.bridge") === false) {
        this.onBodyClick(e);

      }
    });
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
