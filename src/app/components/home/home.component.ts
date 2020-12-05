import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {MockScoreService} from "../../services/mock-score/mock-score.service";
import {DepositService} from "../../services/deposit/deposit.service";
import {
  ommPrefixPlusFormat,
  percentageFormat, prefixPlusFormat,
  usdbFormat, usdbPrefixMinusFormat,
  usdbPrefixPlusFormat,
  usdFormat, usdTwoDecimalMinusFormat, usdTwoDecimalPlusFormat
} from "../../common/formatting";
import {Reserve} from "../../interfaces/reserve";
import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {SlidersService} from "../../services/sliders/sliders.service";
import {RepayService} from "../../services/repay/repay.service";
import {CalculationsService} from "../../services/calculations/calculations.service";

declare var $: any;
declare var noUiSlider: any;
declare var wNumb: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  public bridgeSupplySlider: any;
  public bridgeBorrowSlider: any;
  public iconSupplySlider: any;
  public iconBorrowSlider: any;
  public riskRatio: any;

  // Position manager variables USDb
  public supplyDepositedUSDb: any;
  public supplyAvailableUSDb: any;
  public borrowBorrowedUSDb: any;
  public borrowAvailableUSDb: any;
  public borrowAvailableRangeUSDb: any;
  public supplyRewardsUSDb: any;

  // Position manager variables ICX
  public supplyDepositedIcx: any;
  public supplyAvailableIcx: any;
  public borrowBorrowedIcx: any;
  public borrowAvailableIcx: any;
  public borrowAvailableRangeIcx: any;
  public supplyRewardsIcx: any;

  constructor(public persistenceService: PersistenceService,
              public mockScoreService: MockScoreService,
              public depositService: DepositService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService) {
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


    // Bridge borrow slider
    this.bridgeBorrowSlider = document.getElementById('bridge-borrow-slider');
    this.slidersService.createNoUiSlider(this.bridgeBorrowSlider, 1500, undefined, undefined, undefined,
      {min: [0], max: [3300]});

    // Icon supply slider
    this.iconSupplySlider = document.getElementById('icon-supply-slider');
    this.slidersService.createNoUiSlider(this.iconSupplySlider, 0);

    // Icon borrow slider
    this.iconBorrowSlider = document.getElementById('icon-borrow-slider');
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
    this.supplyDepositedUSDb = document.getElementById('supply-deposited');
    this.supplyAvailableUSDb = document.getElementById('supply-available');
    this.borrowBorrowedUSDb = document.getElementById('borrow-borrowed');
    this.borrowAvailableUSDb = document.getElementById('borrow-available');
    this.borrowAvailableRangeUSDb = document.getElementById('borrow-limit');
    this.supplyRewardsUSDb = document.getElementById('supply-rewards');

    this.supplyDepositedIcx = document.getElementById('supply-deposited-icon');
    this.supplyAvailableIcx = document.getElementById('supply-available-icon');
    this.borrowBorrowedIcx = document.getElementById('borrow-borrowed');
    this.borrowAvailableIcx = document.getElementById('borrow-available');
    this.borrowAvailableRangeIcx = document.getElementById('borrow-limit');
    this.supplyRewardsIcx = document.getElementById('supply-rewards');


    /*
    * Bridge supply slider
    */
    this.bridgeSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {
      // Supply deposited / available text boxes
      this.supplyDepositedUSDb.value = usdbFormat.to(values[handle] * 1);
      this.supplyAvailableUSDb.value = usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbSupply(+values[handle]));

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
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) / usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) / usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100));
      // Update borrow limit
      // this.borrowAvailable.value = (usdbFormat.to((usdbFormat.from(this.supplyDeposited.value) * 0.33) - 1500));
      // Update borrow range
      // updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailable.value)));
    });

    /*
    * Bridge borrow sliders
    */
    // Bridge borrow slider updates the borrow borrowed editbox
    // tslint:disable-next-line:no-shadowed-variable
    this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      this.borrowBorrowedUSDb.value = usdbFormat.to(values[handle] * 1);
      this.borrowAvailableUSDb.value = (usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbBorrow(values[handle])));
      // Supply interest
      $('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
      $('.borrow-interest-dollar').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365) + 0.12));
      // Supply rewards
      $('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));
      // Position borrow
      $('.position-borrow').text(usdFormat.to((values[handle] * 1) + 1212));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100));
      // Adjust locked indicator for collateral
      document.getElementById("locked")!.style.left = (23 * (usdbFormat.from(this.borrowBorrowedUSDb.value) / 2053)) + "%";
    });


    /*
    * ICX supply slider
    */
    this.iconSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {
      // Supply deposited / available text boxes
      this.supplyDepositedUSDb.value = usdbFormat.to(values[handle] * 1);
      this.supplyAvailableUSDb.value = usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbSupply(+values[handle]));

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
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) / usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) / usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100));
      // Update borrow limit
      // this.borrowAvailable.value = (usdbFormat.to((usdbFormat.from(this.supplyDeposited.value) * 0.33) - 1500));
      // Update borrow range
      // updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailable.value)));
    });

    /*
    * ICX borrow sliders
    */
    // Bridge borrow slider updates the borrow borrowed editbox
    // tslint:disable-next-line:no-shadowed-variable
    this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      this.borrowBorrowedUSDb.value = usdbFormat.to(values[handle] * 1);
      this.borrowAvailableUSDb.value = (usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbBorrow(values[handle])));
      // Supply interest
      $('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
      $('.borrow-interest-dollar').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365) + 0.12));
      // Supply rewards
      $('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));
      // Position borrow
      $('.position-borrow').text(usdFormat.to((values[handle] * 1) + 1212));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100);
      // Update risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedUSDb.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowedUSDb.value)) * 100));
      // Adjust locked indicator for collateral
      document.getElementById("locked")!.style.left = (23 * (usdbFormat.from(this.borrowBorrowedUSDb.value) / 2053)) + "%";
    });


    /* ==========================================================================
    Handle variable/state changes for subscribed values
    ========================================================================== */

    this.persistenceService.userUSDbBalanceChange.subscribe(userUSDbBalance => {
      console.log("homePage-> userUSDbBalanceChange:", userUSDbBalance);
      if (this.bridgeSupplySlider) {
        this.supplyAvailableUSDb.value = usdbFormat.to(userUSDbBalance);
        this.bridgeSupplySlider.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: userUSDbBalance + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
          }
        });
      }
    });

    this.persistenceService.userUSDbReserveChange.subscribe((userUSDbReserve: Reserve) => {
      console.log("homePage-> userUSDbReserveChange:", userUSDbReserve);
      console.log("homePage-> userUSDbReserveChange -> noUiSlider.set -> " + userUSDbReserve.currentOTokenBalance);
      // set new USDb supplied value to input deposit amount, supply slider and supply deposited value
      this.supplyDepositedUSDb.value = usdbFormat.to(userUSDbReserve.currentOTokenBalance);
      this.bridgeSupplySlider.noUiSlider.set(userUSDbReserve.currentOTokenBalance);
      // update USDb slider max value to  -> user USDb balance + supplied USDb
      this.bridgeSupplySlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: (this.persistenceService.iconexWallet?.balances.USDb ?? 0) +
            (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
        }
      });
      // set borrow supplied and slider value
      this.borrowBorrowedUSDb.value = usdbFormat.to(userUSDbReserve.principalBorrowBalance);
      this.borrowAvailableUSDb.value = this.calculationService.calculateSliderAvailableUSDbBorrow(usdbFormat.from(this.borrowAvailableUSDb.value));
      this.bridgeBorrowSlider.noUiSlider.set(userUSDbReserve.principalBorrowBalance);
      // update USDb borrow slider max value to  -> user USDb balance + supplied USDb
      this.bridgeBorrowSlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: this.calculationService.calculateUSDbBorrowSliderMax()
        }
      });
    });
  }

  public onBorrowUSDbConfirmClick(): void {
    const amount = +usdbFormat.from(this.borrowBorrowedUSDb.value);
    const borrowAmountDiff = amount - Math.floor(this.persistenceService.userUSDbReserve!.currentBorrowBalance);
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
      alert("No change in borrowed value!");
      return;
    }
  }

  public onUSDbSupplyConfirmClick(): void {
    let amount = +usdbFormat.from(this.supplyDepositedUSDb.value);
    console.log("onUSDbSupplyConfirmClick -> amount = " , amount);
    // check that value is not greater than user USDb balance
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance) {
        amount = Math.floor(this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance);
        this.bridgeSupplySlider.noUiSlider.set(amount);
        return;
      }
    }
    const supplyAmountDiff = amount - Math.floor(this.persistenceService.userUSDbReserve!.currentOTokenBalance);
    // toggle USDb assets view
    this.onAssetBridgeClick();
    if (supplyAmountDiff > 0) {
      console.log("Actual deposit = ", supplyAmountDiff);
      // toggle USDb asset
      // deposit the amount - current supply
      this.depositService.depositUSDb(supplyAmountDiff);
    } else if (supplyAmountDiff < 0) {
      console.log("Actual withdraw = ", supplyAmountDiff);
      this.withdrawService.withdrawUSDb(Math.abs(supplyAmountDiff));

    } else {
      alert("No change in supplied value!");
      return;
    }
  }

  public onIcxSupplyConfirmClick(): void {
    const amount = +usdbFormat.from(this.supplyDepositedIcx.value);
    console.log("onIcxSupplyConfirmClick -> amount = " , amount);
    // check that value is not greater than user ICX balance
    // if (this.persistenceService.iconexWallet) {
    //   if (amount > this.persistenceService.iconexWallet.balances.ICX + this.persistenceService.userIcxReserve!.currentOTokenBalance) {
    //     amount = Math.floor(this.persistenceService.iconexWallet.balances.ICX + this.persistenceService.userIcxReserve!.currentOTokenBalance);
    //     this.bridgeSupplySlider.noUiSlider.set(amount);
    //     return;
    //   }
    // }
    // const supplyAmountDiff = amount - Math.floor(this.persistenceService.userIcxReserve!.currentOTokenBalance);
    // toggle USDb assets view
    this.onAssetBridgeClick();
    // if (supplyAmountDiff > 0) {
    // console.log("Actual deposit = ", supplyAmountDiff);
      // toggle USDb asset
      // deposit the amount - current supply
    this.depositService.depositIcxToLendingPool(amount);
    // }
    // else if (supplyAmountDiff < 0) {
    //   console.log("Actual withdraw = ", supplyAmountDiff);
    //   this.withdrawService.withdrawUSDb(Math.abs(supplyAmountDiff));
    // }
    // else {
    //   alert("No change in supplied value!");
    //   return;
    // }
    this.borrowService.borrowIcx(amount - 1);
  }

  public depositUSDbAmountChange(): void {
    const amount = +usdbFormat.from(this.supplyDepositedUSDb.value);
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.USDb) {
        this.supplyDepositedUSDb.style.borderColor = "red";
      } else {
        this.supplyDepositedUSDb.style.borderColor = "#c7ccd5";
      }
    }
  }

  public depositIcxAmountChange(): void {
    const amount = +usdbFormat.from(this.supplyDepositedIcx.value);
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.ICX) {
        this.supplyDepositedIcx.style.borderColor = "red";
      } else {
        this.supplyDepositedIcx.style.borderColor = "#c7ccd5";
      }
    }
  }

  public borrowUSDbAmountChange(): void {
    this.borrowBorrowedUSDb.value = +usdbFormat.from(this.borrowBorrowedUSDb.value);
    // TODO add check
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
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 1500);
      this.supplyAvailableUSDb.value = usdbFormat.to((this.persistenceService.iconexWallet?.balances.USDb ?? 5000) +
        (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0));
      this.supplyDepositedUSDb.value = usdbFormat.to(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000);
    }

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
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

    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').toggleClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);
    }
  }

  public onSupplyAdjustIcxClick(): void {
    $('#supply').toggleClass("adjust");
    $('.supply-actions').toggleClass("hide");
    $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
    $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
    // this.bridgeSupplySlider.toggleAttribute('disabled');
    // this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000);

    // if ($("#borrow").hasClass("adjust")) {
    //   $('#borrow').toggleClass("adjust");
    //   $('.borrow-actions').toggleClass("hide");
    //   $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
    //   $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
    //   this.bridgeBorrowSlider.toggleAttribute('disabled');
    //   this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);
    // }
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

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
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

    // Disable borrow adjust view
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(1500);
    }
  }

}


