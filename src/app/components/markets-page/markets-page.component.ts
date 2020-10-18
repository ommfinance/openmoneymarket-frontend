import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from '../../services/iconex-api/iconex-api.service';
import {PersistenceService} from '../../services/persistence-service/persistence.service';
import {MockScoreService} from '../../services/mock-score/mock-score.service';
import {BaseClass} from '../base-class';
declare var $: any;

@Component({
  selector: 'app-markets-page',
  templateUrl: './markets-page.component.html',
  styleUrls: ['./markets-page.component.css']
})
export class MarketsPageComponent extends BaseClass implements OnInit, OnDestroy {

  public USDbDepositAmount = 0;

  constructor(private iconexApiService: IconexApiService,
              public persistenceService: PersistenceService,
              public mockScoreService: MockScoreService) {
    super();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  onConnectWalletClick(): void {
    this.iconexApiService.hasAccount();
  }

  onDepositUSDbClick(): void {
    this.mockScoreService.depositUSDb(this.USDbDepositAmount);
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
