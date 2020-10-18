import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from '../../services/iconex-api/iconex-api.service';
import {PersistenceService} from '../../services/persistence.service';
declare var $: any;

@Component({
  selector: 'app-markets-page',
  templateUrl: './markets-page.component.html',
  styleUrls: ['./markets-page.component.css']
})
export class MarketsPageComponent implements OnInit, OnDestroy {

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

  onSendButton1Click(): void {
    $('#send-button-1').toggleClass("active");
    $("#wallet-expanded-1").slideToggle();
  }
  onMainClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').removeClass("active");
    $('.profile').removeClass("active");
  }
  onProfileClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').toggleClass("active");
    $('.profile').toggleClass("active");
  }

}
