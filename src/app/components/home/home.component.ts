import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence-service/persistence.service";
import {MockScoreService} from "../../services/mock-score/mock-score.service";
import {DepositService} from "../../services/deposit-service/deposit.service";
import {
  ommPrefixPlusFormat,
  percentageFormat, prefixPlusFormat,
  usdbFormat, usdbPrefixMinusFormat,
  usdbPrefixPlusFormat,
  usdFormat, usdTwoDecimalMinusFormat, usdTwoDecimalPlusFormat
} from "../../common/formatting";
import {UserUSDbReserve} from "../../interfaces/user-usdb-reserve";
import {WithdrawService} from "../../services/withdraw-service/withdraw.service";
import {BorrowService} from "../../services/borrow-service/borrow.service";
import {SlidersService} from "../../services/sliders/sliders.service";
import {RepayService} from "../../services/repay-service/repay.service";

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
  public USDbBorrowAmount = 0;
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
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    /* ==========================================================================
    Position manager sliders
    ========================================================================== */

    // Bridge supply slider
    this.bridgeSupplySlider = document.getElementById('bridge-supply-slider');
    this.slidersService.createNoUiSlider(this.bridgeSupplySlider);


    // Bridge borrow-service slider
    this.bridgeBorrowSlider = document.getElementById('bridge-borrow-slider');
    this.slidersService.createNoUiSlider(this.bridgeBorrowSlider, 1500, undefined, undefined, undefined,
      {min: [0], max: [3300]});

    // Icon supply slider
    this.iconSupplySlider = document.getElementById('icon-supply-slider');
    this.slidersService.createNoUiSlider(this.iconSupplySlider, 0);

    // Icon borrow-service slider
    this.iconBorrowSlider = document.getElementById('icon-borrow-service-slider');
    this.slidersService.createNoUiSlider(this.iconBorrowSlider, 9480, 0, undefined, undefined,
      {min: [0], max: [16000]});

    // Risk slider
    this.riskRatio = document.getElementById('risk-slider');
    noUiSlider.create(this.riskRatio, {
      start: [37],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: '%'})],
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
    this.borrowAvailableRange = document.getElementById('borrow-service-limit');
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
      // Position borrow-service limit
      $('#position-borrow-service-limit').text(usdFormat.to(values[handle] * 1 + 10000));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100));
      // Update borrow-service limit
      this.borrowAvailable.value = (usdbFormat.to((usdbFormat.from(this.supplyDeposited.value) * 0.33) - 1500));
      // Update borrow-service range
      // updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailable.value)));
    });

    /*
    * Bridge borrow-service sliders
    */
    // Bridge borrow-service slider updates the borrow-service borrowed editbox
    // tslint:disable-next-line:no-shadowed-variable
    this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      // Bridge borrow-service text boxes
      this.borrowBorrowed.value = usdbFormat.to(values[handle] * 1);
      this.borrowBorrowed.value = (usdbFormat.to(3300 - values[handle]));
      // Supply interest
      $('#borrow-service-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
      $('.borrow-service-interest-dollar').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365) + 0.12));
      // Supply rewards
      $('#borrow-service-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));
      // Position borrow-service
      $('.position-borrow-service').text(usdFormat.to((values[handle] * 1) + 1212));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100));
      // Adjust locked indicator for collateral
      document.getElementById("locked")!.style.left = (23 * (usdbFormat.from(this.borrowBorrowed.value) / 2053)) + "%";
    });


    // subscribed handlers
    this.persistenceService.userUSDbBalanceChange.subscribe(userUSDbBalance => {
      console.log("homePage-> userUSDbBalanceChange:", userUSDbBalance);
      if (this.bridgeSupplySlider) {
        this.supplyAvailable.value = usdbFormat.to(userUSDbBalance);
        this.bridgeSupplySlider.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: userUSDbBalance + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
          }
        });
      }
    });
    this.persistenceService.userUSDbReserveChange.subscribe((userUSDbReserve: UserUSDbReserve) => {
      console.log("homePage-> userUSDbReserveChange:", userUSDbReserve);
      this.supplyDeposited.value = usdbFormat.to(userUSDbReserve.currentOTokenBalance);
      console.log("homePage-> userUSDbReserveChange -> set slider value = " + userUSDbReserve.currentOTokenBalance);
      this.bridgeSupplySlider.noUiSlider.set(userUSDbReserve.currentOTokenBalance);
      this.bridgeSupplySlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: (this.persistenceService.iconexWallet?.balances.USDb ?? 0) + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
        }
      });
    });
  }

  public onBorrowUSDbConfirmClick(): void {
    this.USDbBorrowAmount = Math.floor(this.USDbBorrowAmount);
    const borrowAmountDiff = this.USDbBorrowAmount - Math.floor(this.persistenceService.userUSDbReserve!.currentBorrowBalance);
    // toggle USDb assets view
    this.onAssetBridgeClick();
    if (borrowAmountDiff > 0) {
      console.log("Actual borrow = ", borrowAmountDiff);
      // toggle USDb asset
      this.borrowService.borrowUSDb(borrowAmountDiff);
    } else if (borrowAmountDiff < 0) {
      console.log("Actual repay = ", borrowAmountDiff);
      this.repayService.repayUSDb(Math.abs(borrowAmountDiff));
    } else {
      alert("No change in supplied value!");
      return;
    }

    this.borrowService.borrowUSDb(this.USDbBorrowAmount);
  }

  public onUSDbSupplyConfirmClick(): void {
    this.USDbDepositAmount = Math.floor(this.USDbDepositAmount);
    // check that value is not greater than user USDb balance
    if (this.persistenceService.iconexWallet) {
      if (this.USDbDepositAmount > this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance) {
        this.USDbDepositAmount = Math.floor(this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance);
        this.bridgeSupplySlider.noUiSlider.set(this.USDbDepositAmount);
        return;
      }
    }
    const supplyAmountDiff = this.USDbDepositAmount - Math.floor(this.persistenceService.userUSDbReserve!.currentOTokenBalance);
    // toggle USDb assets view
    this.onAssetBridgeClick();
    if (supplyAmountDiff > 0) {
      console.log("Actual deposit-service = ", supplyAmountDiff);
      // toggle USDb asset
      // deposit-service the amount - current supply
      this.depositService.depositUSDb(supplyAmountDiff);
    } else if (supplyAmountDiff < 0) {
      console.log("Actual withdraw-service = ", supplyAmountDiff);
      this.withdrawService.withdrawUSDb(Math.abs(supplyAmountDiff));

    } else {
      alert("No change in supplied value!");
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

  public borrowUSDbAmountChange(): void {
    this.USDbBorrowAmount = +usdbFormat.from(this.borrowBorrowed.value);
    // if (this.persistenceService.iconexWallet) {
    //   if (this.USDbBorrowAmount > this.persistenceService.iconexWallet.balances.USDb) {
    //     this.supplyDeposited.style.borderColor = "red";
    //   } else {
    //     this.supplyDeposited.style.borderColor = "#c7ccd5";
    //   }
    // }
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

    // Disable borrow-service adjust view
    if ($("#borrow-service").hasClass("adjust")) {
      $('#borrow-service').removeClass("adjust");
      $('.borrow-service-actions').toggleClass("hide");
      $('#borrow-service-borrowed').prop('disabled', function(i: any, v: any) { return !v; });
      $('#borrow-service-available').prop('disabled', function(i: any, v: any) { return !v; });
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);
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
    this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000);

    if ($("#borrow-service").hasClass("adjust")) {
      $('#borrow-service').toggleClass("adjust");
      $('.borrow-service-actions').toggleClass("hide");
      $('#borrow-service-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-service-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);
    }
  }

// Borrow adjust logic
  public onBorrowAdjustClick(): void {
    $('#borrow').toggleClass("adjust");
    $('.borrow-actions').toggleClass("hide");
    $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
    $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
    this.bridgeBorrowSlider.toggleAttribute('disabled');
    this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);

    if ($("#supply").hasClass("adjust")) {

      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000);

    }
  }

  /* ==========================================================================
    Toggle logic
  ========================================================================== */

  // All markets logic
  public onToggleAllMarketsClick(): void {
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
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
    }

    // Disable borrow-service adjust view
    if ($("#borrow-service").hasClass("adjust")) {
      $('#borrow-service').removeClass("adjust");
      $('.borrow-service-actions').toggleClass("hide");
      $('#borrow-service-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-service-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }
  // Your markets logic
  public onToggleYourMarketsClick(): void {
    $("#toggle-your-markets").addClass('active');
    $("#toggle-all-markets").removeClass('active');
    $("#your-markets-list").show();
    $("#all-markets-list").hide();
  }

  // Market overview logic
  public onToggleMarketOverviewClick(): void {
    $("#toggle-your-overview").removeClass('active');
    $("#toggle-market-overview").addClass('active');
    $("#your-overview-content").hide();
    $("#market-overview-content").show();
  }

  // Your overview logic
  public onToggleYourOverviewClick(): void {
    $("#toggle-your-overview").addClass('active');
    $("#toggle-market-overview").removeClass('active');
    $("#your-overview-content").show();
    $("#market-overview-content").hide();
  }

  // ICON
  public onAssetIconClick(): void {
    $("#asset-icon").toggleClass('active');
    $("#asset-icon-expanded").slideToggle();
    // Bridge
    $("#asset-bridge-expanded").slideUp();
    $("#asset-bridge").removeClass('active');

    // Disable supply adjust view
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
    }

    // Disable borrow-service adjust view
    if ($("#borrow-service").hasClass("adjust")) {
      $('#borrow-service').removeClass("adjust");
      $('.borrow-service-actions').toggleClass("hide");
      $('#borrow-service-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-service-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }

}


