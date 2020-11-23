import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from './services/iconex-api/iconex-api.service';
import {DataLoaderService} from './services/data-loader-service/data-loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'Open money market';

  private attachedListener: boolean;

  constructor(private iconexApiService: IconexApiService,
              private dataLoaderService: DataLoaderService) {
    window.addEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
    this.attachedListener = true;
    dataLoaderService.loadAllScoreAddresses().then(() => dataLoaderService.loadAllReserves());
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
}
