import {Component, OnDestroy, OnInit} from "@angular/core";
import {PersistenceService} from "../../services/persistence.service";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";

@Component({
  selector: "app-iconex-login",
  templateUrl: "./iconex-login.component.html",
  styleUrls: ["./iconex-login.component.css"]
})
export class IconexLoginComponent implements OnInit, OnDestroy {



  constructor(private iconexApiService: IconexApiService,
              public persistenceService: PersistenceService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  onConnectWalletClick(): void {
    this.iconexApiService.hasAccount();
  }


}
