import {Component, OnDestroy, OnInit} from '@angular/core';
import {IconexApiService} from '../../services/iconex-api/iconex-api.service';
import {PersistenceService} from '../../services/persistence-service/persistence.service';
import {MockScoreService} from '../../services/mock-score/mock-score.service';
import {BaseClass} from '../base-class';
declare var $: any;
declare var noUiSlider: any;
declare var wNumb: any;

/*
*
* Formats
*
*/

// %

const percentageFormat = wNumb({
  decimals: 0,
  suffix: '%'
});

// ICX

const icxFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' ICX'
});

// USDb

const usdbFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' USDb'
});

// + USDb .00

const usdbPrefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + ',
  suffix: ' USDb'
});

// - USDb .00

const usdbPrefixMinusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' - ',
  suffix: ' USDb'
});

// + OMM .00

const ommPrefixPlusFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: ' + ',
  suffix: ' OMM'
});

// ICD

const icdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  suffix: ' ICD'
});

// $

const usdFormat = wNumb({
  decimals: 0,
  thousand: ',',
  prefix: '$'
});

// $ .00

const usdTwoDecimalFormat = wNumb({
  decimals: 2,
  thousand: ',',
  prefix: '$'
});

@Component({
  selector: 'app-markets-page',
  templateUrl: './markets-page.component.html',
  styleUrls: ['./markets-page.component.css']
})
export class MarketsPageComponent extends BaseClass implements OnInit, OnDestroy {

  public USDbDepositAmount = 0;
  public bridgeSupplySlider: any;
  public bridgeBorrowSlider: any;
  public riskRatio: any;

  // Position manager variables
  public supplyDeposited: any;
  public supplyAvailable: any;
  public borrowBorrowed: any;
  public borrowAvailable: any;
  public borrowAvailableRange: any;
  public supplyRewards: any;

  constructor(private iconexApiService: IconexApiService,
              public persistenceService: PersistenceService,
              public mockScoreService: MockScoreService) {
    super();
  }

  ngOnInit(): void {/* ==========================================================================
    Position manager sliders
========================================================================== */

// Bridge supply slider

    this.bridgeSupplySlider = document.getElementById('bridge-supply-slider');

    noUiSlider.create(this.bridgeSupplySlider, {
      start: [10000],
      padding: [4550],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
      range: {
        min: [0],
        max: [15000]
      },
      format: wNumb({
        decimals: 0,
      })
    });

    this.riskRatio = document.getElementById('risk-slider');
    noUiSlider.create(this.riskRatio, {
      start: [37],
      connect: 'lower',
      tooltips: [true],
      range: {
        min: [0],
        max: [100]
      },
    });

    // Position manager variables
    this.supplyDeposited = document.getElementById('supply-deposited');
    this.supplyAvailable = document.getElementById('supply-available');
    this.borrowBorrowed = document.getElementById('borrow-borrowed');
    this.borrowAvailable = document.getElementById('borrow-available');
    this.borrowAvailableRange = document.getElementById('borrow-limit');
    this.supplyRewards = document.getElementById('supply-rewards');

    /*
    *
    * Bridge supply slider
    *
    */
    this.bridgeSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {

      // Supply deposited / available text boxes
      this.supplyDeposited.value = usdbFormat.to(values[handle] * 1);
      this.supplyAvailable.value = usdbFormat.to(15000 - usdbFormat.from(this.supplyDeposited.value));

      // Supply interest
      $('#supply-interest').text(usdbPrefixPlusFormat.to((values[handle] * 1) * 0.0647 / 365));

      // Supply rewards
      $('#supply-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.447 / 365));

      // Position supply
      $('#position-supply').text(usdFormat.to(values[handle] * 1));

      // Position borrow limit
      $('#position-borrow-limit').text(usdFormat.to(values[handle] * 1 + 10000));

      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowed.value)) * 100);

      // Update risk percentage
      $('#risk-percentage-bridge').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowed.value)) * 100));

      /*
      *
      * Bridge borrow sliders
      *
      */

      // Bridge borrow slider updates the borrow borrowed editbox

      this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {

        // Bridge borrow text boxes
        this.borrowBorrowed.value = usdbFormat.to(values[handle] * 1);
        this.borrowAvailable.value = (usdbFormat.to(3300 - values[handle]));

        // Supply interest
        $('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));

        // Supply rewards
        $('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

        // Position borrow
        $('#position-borrow').text(usdFormat.to(values[handle] * 1));

        // Risk ratio
        this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) /
          usdbFormat.from(this.borrowBorrowed.value)) * 100);

        // Update risk percentage
        $('#risk-percentage-bridge').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) /
          usdbFormat.from(this.borrowBorrowed.value)) * 100));

      });

    });
  }

  ngOnDestroy(): void {
  }

  onConnectWalletClick(): void {
    this.iconexApiService.hasAccount();
  }

  onDepositUSDbClick(): void {
    this.mockScoreService.depositUSDb(this.USDbDepositAmount);
  }

/* ==========================================================================
    Asset expand logic
========================================================================== */
  onAssetBridgeClick(): void {
    $("#asset-bridge").toggleClass('active');
    $("#asset-bridge-expanded").slideToggle();
    $("#position-overview").slideToggle();
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

  /* ==========================================================================
	Position manager logic
========================================================================== */

// supply adjust logic

  public onSupplyAdjustClick(): void {
    $('#supply').toggleClass("adjust");
    $('.supply-actions').toggleClass("hide");
    $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
    $('#supply-available').prop('disabled', (i: any, v: any) => !v);
    this.bridgeSupplySlider.toggleAttribute('disabled');
    this.bridgeSupplySlider.noUiSlider.set(10000);

    if ($("#borrow").hasClass("adjust")) {

      $('#borrow').toggleClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }

// Borrow adjust logic

  public onBorrowAdjustClick(): void {
    $('#borrow').toggleClass("adjust");
    $('.borrow-actions').toggleClass("hide");
    $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
    $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
    this.bridgeBorrowSlider.toggleAttribute('disabled');
    this.bridgeBorrowSlider.noUiSlider.set(1500);

    if ($("#supply").hasClass("adjust")) {

      $('#supply').toggleClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      this.bridgeSupplySlider.noUiSlider.set(10000);

    }
  }

}


