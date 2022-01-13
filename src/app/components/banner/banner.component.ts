import { Component, OnInit } from '@angular/core';
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {ommBannerExitKey} from "../../common/constants";
import log from "loglevel";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  // show banner only if the user has not pressed x on this device (localstorage)
  showBanner = (this.localstorageService.get(ommBannerExitKey) as boolean) && environment.SHOW_BANNER;

  constructor(private localstorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.showBanner = this.localstorageService.get(ommBannerExitKey) as boolean;
    log.debug("showBanner = ", this.showBanner);
  }

  onBannerExitClick(): void {
    this.localstorageService.set(ommBannerExitKey, false);
    this.showBanner = false;
  }
}
