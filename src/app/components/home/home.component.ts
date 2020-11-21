import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence-service/persistence.service";
import {MockScoreService} from "../../services/mock-score/mock-score.service";
import {DepositService} from "../../services/deposit/deposit.service";
import {
  ommPrefixPlusFormat,
  percentageFormat, prefixPlusFormat,
  usdbFormat, usdbPrefixMinusFormat,
  usdbPrefixPlusFormat,
  usdFormat, usdTwoDecimalMinusFormat, usdTwoDecimalPlusFormat
} from "../../common/formatting";
import {UserUSDbReserve} from "../../interfaces/user-usdb-reserve";
import {WithdrawService} from "../../services/withdraw/withdraw.service";

declare var $: any;
declare var noUiSlider: any;
declare var wNumb: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  public USDbDepositAmount = 0;
  public bridgeSupplySlider: any;
  public bridgeBorrowSlider: any;
  public iconSupplySlider: any;
  public iconBorrowSlider: any;
  public riskRatio: any;

  // Position manager variables
  public supplyDeposited: any;
  public supplyAvailable: any;
  public borrowBorrowed: any;
  public borrowAvailable: any;
  public borrowAvailableRange: any;
  public supplyRewards: any;

  constructor(public persistenceService: PersistenceService,
              public mockScoreService: MockScoreService,
              public depositService: DepositService,
              public withdrawService: WithdrawService) {
    super();
    this.persistenceService.userUSDbBalanceChange.subscribe(userUSDbBalance => {
      console.log("homePage-> userUSDbBalanceChange:", userUSDbBalance)
      if (this.bridgeSupplySlider) {
        this.supplyAvailable.value = usdbFormat.to(userUSDbBalance);
        this.bridgeSupplySlider.noUiSlider.updateOptions({
          range: {
            'min': 0,
            'max': userUSDbBalance + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
          }
        });
      }
    });
    this.persistenceService.userUSDbReserveChange.subscribe((userUSDbReserve: UserUSDbReserve) => {
      console.log("homePage-> userUSDbReserveChange:", userUSDbReserve)
      this.supplyDeposited.value = usdbFormat.to(userUSDbReserve.currentOTokenBalance);
      console.log("homePage-> userUSDbReserveChange -> set slider value = " + userUSDbReserve.currentOTokenBalance);
      this.bridgeSupplySlider.noUiSlider.set(userUSDbReserve.currentOTokenBalance);
      this.bridgeSupplySlider.noUiSlider.updateOptions({
        range: {
          'min': 0,
          'max': (this.persistenceService.iconexWallet?.balances.USDb ?? 0) + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
        }
      });
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    /* ==========================================================================
    Position manager sliders
    ========================================================================== */

    // Bridge supply slider
    this.bridgeSupplySlider = document.getElementById('bridge-supply-slider');
    noUiSlider.create(this.bridgeSupplySlider, {
      start: [10000],
      padding: [0],
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

    // Bridge borrow slider
    this.bridgeBorrowSlider = document.getElementById('bridge-borrow-slider');
    noUiSlider.create(this.bridgeBorrowSlider, {
      start: [1500],
      padding: [0],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
      range: {
        min: [0],
        max: [3300]
      },
      format: wNumb({
        decimals: 0,
      })
    });

    // Icon supply slider
    this.iconSupplySlider = document.getElementById('icon-supply-slider');
    noUiSlider.create(this.iconSupplySlider, {
      start: [0],
      padding: [0],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
      range: {
        'min': [0],
        'max': [15000]
      },
      format: wNumb({
        decimals: 0,
      })
    });

    // Icon borrow slider
    this.iconBorrowSlider = document.getElementById('icon-borrow-slider');
    noUiSlider.create(this.iconBorrowSlider, {
      start: [9480],
      padding: [0],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: ' USDb'})],
      range: {
        'min': [0],
        'max': [16000]
      },
      format: wNumb({
        decimals: 0,
      })
    });


    // Risk slider
    this.riskRatio = document.getElementById('risk-slider');
    noUiSlider.create(this.riskRatio, {
      start: [37],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: '%'})],
      range: {
        'min': [0],
        'max': [100]
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
    * Bridge supply slider
    */
    this.bridgeSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {
      // Supply deposited / available text boxes
      this.USDbDepositAmount = +values[handle];
      this.supplyDeposited.value = usdbFormat.to(values[handle] * 1);
      this.supplyAvailable.value = usdbFormat.to((this.persistenceService.iconexWallet?.balances.USDb ?? 15000) -
        (usdbFormat.from(this.supplyDeposited.value) - (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)));

      // Supply interest
      $('.supply-interest').text(usdbPrefixPlusFormat.to((values[handle] * 1) * 0.0647 / 365));
      $('.supply-interest-dollar').text(usdTwoDecimalPlusFormat.to((values[handle] * 1) * 0.0647 / 365));
      // Supply rewards
      $('#supply-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.447 / 365));
      $('.supply-rewards-total').text(prefixPlusFormat.to(((values[handle] * 1) * 0.447 / 365) + 4.74));
      // Position supply
      $('.position-supply').text(usdFormat.to(values[handle] * 1));
      // Position borrow limit
      $('#position-borrow-limit').text(usdFormat.to(values[handle] * 1 + 10000));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100));
      // Update borrow limit
      this.borrowAvailable.value = (usdbFormat.to((usdbFormat.from(this.supplyDeposited.value) * 0.33) - 1500));
      // Update borrow range
      //updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailable.value)));
    });

    /*
    * Bridge borrow sliders
    */
    // Bridge borrow slider updates the borrow borrowed editbox
    // tslint:disable-next-line:no-shadowed-variable
    this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      // Bridge borrow text boxes
      this.borrowBorrowed.value = usdbFormat.to(values[handle] * 1);
      $('.borrow-borrowed-dollar').text(usdFormat.to(values[handle] * 1));
      this.borrowBorrowed.value = (usdbFormat.to(3300 - values[handle]));
      // Supply interest
      $('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
      $('.borrow-interest-dollar').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365) + 0.12));
      // Supply rewards
      $('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));
      // Position borrow
      $('.position-borrow').text(usdFormat.to((values[handle] * 1) + 1212));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100));
      // Adjust locked indicator for collateral
      document.getElementById("locked")!.style.left = (23 * (usdbFormat.from(this.borrowBorrowed.value) / 2053)) + "%";
    });
  }

  public onUSDbSupplyConfirmClick(): void {
    this.USDbDepositAmount = Math.round(this.USDbDepositAmount);
    // check that value is not greater than user USDb balance
    if (this.persistenceService.iconexWallet) {
      if (this.USDbDepositAmount > this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance) {
        this.USDbDepositAmount = Math.floor(this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance);
        this.bridgeSupplySlider.noUiSlider.set(this.USDbDepositAmount);
        return;
      }
    }
    const supplyAmountDiff = this.USDbDepositAmount - Math.round(this.persistenceService.userUSDbReserve!.currentOTokenBalance)
    if (supplyAmountDiff > 0) {
      console.log("Actual deposit = ", supplyAmountDiff)
      // deposit the amount - current supply
      this.depositService.depositUSDb(supplyAmountDiff);
    } else if (supplyAmountDiff < 0) {
      console.log("Actual withdraw = ", supplyAmountDiff)
      this.withdrawService.withdrawUSDb(Math.abs(supplyAmountDiff));

      // toggle USDb asset
      this.onAssetBridgeClick();
    } else {
      alert("No change in supplied value!")
      return;
    }
  }

  public depositUSDbAmountChange(): void {
    this.USDbDepositAmount = +usdbFormat.from(this.supplyDeposited.value);
    if (this.persistenceService.iconexWallet) {
      if (this.USDbDepositAmount > this.persistenceService.iconexWallet.balances.USDb) {
        this.supplyDeposited.style.borderColor = "red";
      } else {
        this.supplyDeposited.style.borderColor = "#c7ccd5";
      }
    }
  }

  ngOnDestroy(): void {
  }

  /* ==========================================================================
      Asset expand logic
  ========================================================================== */
  onAssetBridgeClick(): void {
    $("#asset-bridge").toggleClass('active');
    $("#asset-bridge-expanded").slideToggle();
    // ICON
    $("#asset-icon-expanded").slideUp();
    $("#asset-icon").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', function(i: any, v: any) { return !v; });
      $('#supply-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeSupplySlider.toggleAttribute('disabled');
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', function(i: any, v: any) { return !v; });
      $('#borrow-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }
  onMainClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    $('#profile-tooltip').removeClass("active");
    $('.profile').removeClass("active");
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
    this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000)

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
    }
  }

  /* ==========================================================================
    Toggle logic
  ========================================================================== */

  // All markets logic
  public onToggleAllMarketsClick() {
    $("#toggle-your-markets").removeClass('active');
    $("#toggle-all-markets").addClass('active');
    $("#your-markets-list").hide();
    $("#all-markets-list").show();

    // Your markets logic
    $("#asset-bridge-expanded").slideUp();
    $("#asset-bridge").removeClass('active');
    $("#asset-icon-expanded").slideUp();
    $("#asset-icon").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', function(i: any, v: any) { return !v; });
      $('#supply-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeSupplySlider.toggleAttribute('disabled');
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', function(i: any, v: any) { return !v; });
      $('#borrow-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }
  // Your markets logic
  public onToggleYourMarketsClick() {
    $("#toggle-your-markets").addClass('active');
    $("#toggle-all-markets").removeClass('active');
    $("#your-markets-list").show();
    $("#all-markets-list").hide();
  }

  // Market overview logic
  public onToggleMarketOverviewClick() {
    $("#toggle-your-overview").removeClass('active');
    $("#toggle-market-overview").addClass('active');
    $("#your-overview-content").hide();
    $("#market-overview-content").show();
  }

  // Your overview logic
  public onToggleYourOverviewClick() {
    $("#toggle-your-overview").addClass('active');
    $("#toggle-market-overview").removeClass('active');
    $("#your-overview-content").show();
    $("#market-overview-content").hide();
  }

  // ICON
  public onAssetIconClick() {
    $("#asset-icon").toggleClass('active');
    $("#asset-icon-expanded").slideToggle();
    // Bridge
    $("#asset-bridge-expanded").slideUp();
    $("#asset-bridge").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', function(i: any, v: any) { return !v; });
      $('#supply-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeSupplySlider.toggleAttribute('disabled');
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', function(i: any, v: any) { return !v; });
      $('#borrow-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }

}


