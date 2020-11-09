import { Component, OnInit } from '@angular/core';
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {PersistenceService} from "../../services/persistence-service/persistence.service";
import {DepositService} from "../../services/deposit/deposit.service";

declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public persistenceService: PersistenceService,
              public depositService: DepositService,
              public iconexApiService: IconexApiService) { }

  ngOnInit(): void {
  }

  onConnectWalletClick(): void {
    this.iconexApiService.hasAccount();
  }

  onProfileClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').toggleClass("active");
    $('.profile').toggleClass("active");
  }

}
