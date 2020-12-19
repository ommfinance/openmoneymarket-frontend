import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {DepositService} from "../../services/deposit/deposit.service";
import {
  icxFormat,
  ommPrefixPlusFormat,
  percentageFormat, prefixPlusFormat,
  usdbFormat, usdbPrefixMinusFormat,
  usdbPrefixPlusFormat,
  usdFormat, usdTwoDecimalMinusFormat, usdTwoDecimalPlusFormat
} from "../../common/formats";
import {Reserve} from "../../interfaces/reserve";
import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {SlidersService} from "../../services/sliders/sliders.service";
import {RepayService} from "../../services/repay/repay.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {HeaderComponent} from "../header/header.component";
import * as toggleLogic from "./home-toggle-logic";

declare var $: any;
declare var noUiSlider: any;
declare var wNumb: any;
declare var classie: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy {

  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  public toggleLogic = toggleLogic;

  public bridgeSupplySlider: any;
  public bridgeBorrowSlider: any;
  public iconSupplySlider: any;
  public iconBorrowSlider: any;
  public tapSupplySlider: any;
  public tapBorrowSlider: any;
  public riskRatio: any;

  // Position manager variables USDb (Bridge)
  public supplyDepositedBridge: any;
  public supplyAvailableBridge: any;
  public borrowBorrowedBridge: any;
  public borrowAvailableBridge: any;

  public borrowAvailableRangeUSDb: any;
  public supplyRewardsUSDb: any;

  // Position manager variables ICX (ICON)
  public supplyDepositedIcon: any;
  public supplyAvailableIcon: any;
  public borrowBorrowedIcon: any;
  public borrowAvailableIcon: any;

  // Position manager variables TAP
  public supplyDepositedTap: any;
  public supplyAvailableTap: any;
  public borrowBorrowedTap: any;
  public borrowAvailableTap: any;

  public borrowAvailableRangeIcx: any;
  public supplyRewardsIcx: any;

  constructor(public persistenceService: PersistenceService,
              public depositService: DepositService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService) {
    super();
  }


  initSubscribedValues(): void {
    /* ==========================================================================
    Handle variable/state changes for subscribed values
    ========================================================================== */

    // Bridge dollars - USDb
    this.persistenceService.userUSDbBalanceChange.subscribe(userUSDbBalance => {
      console.log("homePage-> userUSDbBalanceChange:", userUSDbBalance);
      if (this.bridgeSupplySlider) {
        this.supplyAvailableBridge.value = usdbFormat.to(userUSDbBalance);
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
      this.supplyDepositedBridge.value = usdbFormat.to(userUSDbReserve.currentOTokenBalance);
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
      this.borrowBorrowedBridge.value = usdbFormat.to(userUSDbReserve.principalBorrowBalance);
      this.borrowAvailableBridge.value = this.calculationService.calculateSliderAvailableUSDbBorrow(
        usdbFormat.from(this.borrowAvailableBridge.value));
      this.bridgeBorrowSlider.noUiSlider.set(userUSDbReserve.principalBorrowBalance);
      // update USDb borrow slider max value to  -> user USDb balance + supplied USDb
      this.bridgeBorrowSlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: this.calculationService.calculateUSDbBorrowSliderMax()
        }
      });
    });

    this.persistenceService.userUSDbBalanceChange.subscribe(userUSDbBalance => {
      console.log("homePage-> userUSDbBalanceChange:", userUSDbBalance);
      if (this.bridgeSupplySlider) {
        this.supplyAvailableBridge.value = usdbFormat.to(userUSDbBalance);
        this.bridgeSupplySlider.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: userUSDbBalance + (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)
          }
        });
      }
    });
    // ICON - ICX
    this.persistenceService.userIcxReserveChange.subscribe((userIcxReserve: Reserve) => {
      console.log("homePage-> userIcxReserveChange:", userIcxReserve);
      console.log("homePage-> userIcxReserveChange -> noUiSlider.set -> " + userIcxReserve.currentOTokenBalance);
      console.log("this.borrowBorrowedIcon.value=" + this.borrowBorrowedIcon.value);
      // set new ICX supplied value to input deposit amount, supply slider and supply deposited value
      this.supplyDepositedIcon.value = icxFormat.to(userIcxReserve.currentOTokenBalance);
      this.iconSupplySlider.noUiSlider.set(userIcxReserve.currentOTokenBalance);
      // update ICX slider max value to  -> user ICX balance + supplied ICX
      this.iconSupplySlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: (this.persistenceService.iconexWallet?.balances.ICX ?? 0) +
            (this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 0)
        }
      });
      // set borrow supplied and slider value
      this.borrowBorrowedIcon.value = icxFormat.to(userIcxReserve.principalBorrowBalance);
      this.borrowAvailableIcon.value = this.calculationService.calculateSliderAvailableIcxBorrow(
        icxFormat.from(this.borrowAvailableIcon.value));
      console.log("this.iconBorrowSlider.noUiSlider.set(userIcxReserve.principalBorrowBalance) =" + userIcxReserve.principalBorrowBalance);
      this.iconBorrowSlider.noUiSlider.set(userIcxReserve.principalBorrowBalance);
      // update ICX borrow slider max value to  -> user ICX balance + supplied ICX
      this.iconBorrowSlider.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: this.calculationService.calculateIcxBorrowSliderMax()
        }
      });
    });
  }

  ngOnInit(): void {
    /* ==========================================================================
        Sliders
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
    this.slidersService.createNoUiSlider(this.iconSupplySlider, 30000, 0, undefined, undefined,
      {min: [0], max: [30000]});

    // Icon borrow slider
    this.iconBorrowSlider = document.getElementById('icon-borrow-slider');
    this.slidersService.createNoUiSlider(this.iconBorrowSlider, 0, 0, undefined, undefined,
      {min: [0], max: [16000]});

    // TAP supply slider
    this.tapSupplySlider = document.getElementById('tap-supply-slider');
    this.slidersService.createNoUiSlider(this.tapSupplySlider, 0, 0, undefined, undefined,
      {min: [0], max: [15000]});

    // TAP borrow slider
    this.tapBorrowSlider = document.getElementById('tap-borrow-slider');
    this.slidersService.createNoUiSlider(this.tapBorrowSlider, 0, 0, undefined, undefined,
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

    // Bridge
    this.supplyDepositedBridge = document.getElementById('supply-deposited-bridge');
    this.supplyAvailableBridge = document.getElementById('supply-available-bridge');
    this.borrowBorrowedBridge = document.getElementById('borrow-borrowed-bridge');
    this.borrowAvailableBridge = document.getElementById('borrow-available-bridge');

    // ICON
    this.supplyDepositedIcon = document.getElementById('supply-deposited-icon');
    this.supplyAvailableIcon = document.getElementById('supply-available-icon');
    this.borrowBorrowedIcon = document.getElementById('borrow-borrowed-icon');
    this.borrowAvailableIcon = document.getElementById('borrow-available-icon');

    // TAP
    this.supplyDepositedTap = document.getElementById('supply-deposited-tap');
    this.supplyAvailableTap = document.getElementById('supply-available-tap');
    this.borrowBorrowedTap = document.getElementById('borrow-borrowed-tap');
    this.borrowAvailableTap = document.getElementById('borrow-available-tap');


    /* ==========================================================================
    Slider logic
    ========================================================================== */

    /*
    * Bridge sliders
    */

    // On Bridge supply slider update
    this.bridgeSupplySlider.noUiSlider.on('update', (values: any, handle: any) => {
      // Update Bridge supply supplied text box
      this.supplyDepositedBridge.value = usdbFormat.to(values[handle] * 1);
      // Update Bridge supply available text box
      this.supplyAvailableBridge.value = usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbSupply(+values[handle]));
      // Update Bridge borrow limit text box
      this.borrowAvailableBridge.value = (usdbFormat.to((usdbFormat.from(this.supplyDepositedBridge.value) * 0.33) - usdbFormat.from(this.borrowBorrowedBridge.value)));

      // Update Bridge's supply interest
      $('.supply-interest-bridge').text(usdbPrefixPlusFormat.to((values[handle] * 1) * 0.0647 / 365));

      // Update Bridge's supply omm rewards
      $('.supply-rewards-bridge').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.447 / 365));

      // Update the total supplied in a dollar format
      // $('.supply-total-dollar').text(usdFormat.to((values[handle] * 1) + 17000));

      // Update the total supply interest in a dollar format
      $('.supply-interest-total').text(usdTwoDecimalPlusFormat.to(((values[handle] * 1) * 0.0647 / 365) + 0.48));

      // Update the total OMM supply rewards
      $('.omm-rewards-total').text(prefixPlusFormat.to(((values[handle] * 1) * 0.447 / 365) + 4.74));

      // Update the risk slider
      this.riskRatio.noUiSlider.set(1 / ((values[handle] * 0.66) / usdbFormat.from(this.borrowBorrowedBridge.value)) * 100);

      // Update the risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedBridge.value) * 0.66)
        / usdbFormat.from(this.borrowBorrowedBridge.value)) * 100));

      // If risk gets over 75% turn the text red (Not working yet)
      if (this.riskRatio.noUiSlider.get() > 75) {
        $('.risk-percentage').removeClass("text-red");
      }
      if (this.riskRatio.noUiSlider.get() < 75) {
        $('.risk-percentage').removeClass("text-red");
      }

      // Update Bridge borrow slider range (Commented out as we havn't got the right formula)
      // updateBorrowRange(parseFloat(values[handle] * 0.33 - usdbFormat.from(borrowAvailableBridge.value)));
    });


    // On Bridge borrow slider update
    this.bridgeBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      this.borrowBorrowedBridge.value = usdbFormat.to(values[handle] * 1);
      this.borrowAvailableBridge.value = (usdbFormat.to(this.calculationService.calculateSliderAvailableUSDbBorrow(values[handle])));

      // Update Bridge's borrow interest
      $('.borrow-interest-bridge').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));

      // Update Bridge's borrow omm rewards
      $('.borrow-rewards-bridge').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

      // Update the total borrowed in a dollar format
      $('.borrow-total-dollar').text(usdFormat.to((values[handle] * 1)));

      // Update the total borrow interest in a dollar format
      $('.borrow-interest-total').text(usdTwoDecimalMinusFormat.to(((values[handle] * 1) * 0.0725 / 365)));

      // Update the total OMM supply rewards (Not correct formula)
      // $('.omm-rewards-total').text(prefixPlusFormat.to(((values[handle] * 1) * 0.447 / 365) + 4.74));

      // Update the risk slider
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDepositedBridge.value) * 0.66) /
        usdbFormat.from(this.borrowBorrowedBridge.value)) * 100);

      // Update the risk percentage
      $('.risk-percentage').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDepositedBridge.value)
        * 0.66) / usdbFormat.from(this.borrowBorrowedBridge.value)) * 100));

      // If risk gets over 75% turn the text red (Not working yet)
      if (this.riskRatio.noUiSlider.get() > 75) {
        $('.risk-percentage').removeClass("text-red");
      }
      if (this.riskRatio.noUiSlider.get() < 75) {
        $('.risk-percentage').removeClass("text-red");
      }
    });

    /*
    * ICON sliders
    */

    // On ICON supply slider update
    this.iconSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {
      // Supply deposited / available text boxes
      this.supplyDepositedIcon.value = icxFormat.to(values[handle] * 1);
      this.supplyAvailableIcon.value = icxFormat.to(this.calculationService.calculateSliderAvailableIcxSupply(+values[handle]));

      // Update ICX borrow limit text box
      this.borrowAvailableIcon.value = (icxFormat.to((icxFormat.from(this.supplyDepositedIcon.value) * 0.33) - icxFormat.from(this.borrowBorrowedIcon.value)));
      console.log("Update ICX borrow limit text box this.borrowAvailableIcon.value =" + this.borrowAvailableIcon.value);
    });

    // On ICON borrow slider update
    this.iconBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {
      this.borrowBorrowedIcon.value = icxFormat.to(values[handle] * 1);
      this.borrowAvailableIcon.value = (icxFormat.to(this.calculationService.calculateSliderAvailableIcxBorrow(values[handle])));
      console.log("On ICON borrow slider update this.borrowAvailableIcon.value =" + this.borrowAvailableIcon.value);
    });

    /*
    * Tap sliders
    */

    // On Tap supply slider update
    this.tapSupplySlider.noUiSlider.on('update', (values: any, handle: any) => {

    });

    // On Tap borrow slider update
    this.tapBorrowSlider.noUiSlider.on('update', (values: any, handle: any) => {

    });


    const overlay = document.querySelector( '.modal-overlay' );

    [].slice.call( document.querySelectorAll( '.modal-trigger' ) ).forEach(( el: any , i ) => {

      const modal = document.querySelector( '#' + el.getAttribute( 'data-modal' ) );
      const close = modal!.querySelector( '.modal-close' );
      const confirmed = modal!.querySelector('.modal-confirm');

      const removeModal = ( hasPerspective: any ) => {
        classie.remove( modal, 'modal-show' );

        if (hasPerspective) {
          classie.remove( document.documentElement, 'md-perspective' );
        }
      };

      const removeModalHandler = () => {
        removeModal( classie.has( el, 'md-setperspective' ) );
      };

      el.addEventListener( 'click', ( ev: any ) => {
        classie.add( modal, 'modal-show' );
        overlay!.removeEventListener( 'click', removeModalHandler );
        overlay!.addEventListener( 'click', removeModalHandler );
      });

      close!.addEventListener( 'click', ( ev ) => {
        ev.stopPropagation();
        removeModalHandler();
      });

      confirmed!.addEventListener( 'click', ( ev ) => {
        ev.stopPropagation();
        removeModalHandler();
      });
    } );

    this.initSubscribedValues();
  }

  public onBorrowIcxConfirmClick(): void {
    const amount = +icxFormat.from(this.borrowBorrowedIcon.value);
    const borrowAmountDiff = amount - Math.floor(this.persistenceService.userIcxReserve!.currentBorrowBalance);
    // toggle ICX assets view
    this.onAssetIconClick();
    if (borrowAmountDiff > 0) {
      console.log("Actual borrow = ", borrowAmountDiff);
      this.borrowService.borrowIcx(borrowAmountDiff);
    } else if (borrowAmountDiff < 0) {
      console.log("Actual repay = ", borrowAmountDiff);
      this.repayService.repayIcx(Math.abs(borrowAmountDiff));
    } else {
      alert("No change in borrowed value!");
      return;
    }
  }

  public onBorrowUSDbConfirmClick(): void {
    const amount = +usdbFormat.from(this.borrowBorrowedBridge.value);
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
    let amount = +usdbFormat.from(this.supplyDepositedBridge.value);
    console.log("onUSDbSupplyConfirmClick -> amount = " , amount);
    // check that value is not greater than user USDb balance
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.USDb + this.persistenceService.userUSDbReserve!.currentOTokenBalance) {
        amount = Math.floor(this.persistenceService.iconexWallet.balances.USDb +
          this.persistenceService.userUSDbReserve!.currentOTokenBalance);
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
    let amount = +icxFormat.from(this.supplyDepositedIcon.value);
    console.log("onIcxSupplyConfirmClick -> amount = " , amount);
    // check that value is not greater than user ICX balance
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.ICX + this.persistenceService.userIcxReserve!.currentOTokenBalance) {
        amount = Math.floor(this.persistenceService.iconexWallet.balances.ICX +
        this.persistenceService.userIcxReserve!.currentOTokenBalance);
        this.iconSupplySlider.noUiSlider.set(amount);
        return;
      }
    }
    const supplyAmountDiff = amount - Math.floor(this.persistenceService.userIcxReserve!.currentOTokenBalance);
    // toggle ICON assets view
    this.onAssetIconClick();
    if (supplyAmountDiff > 0) {
    console.log("Actual ICX deposit = ", supplyAmountDiff);
    //  deposit the amount - current supply
    this.depositService.depositIcxToLendingPool(amount);
    }
    else if (supplyAmountDiff < 0) {
      console.log("Actual ICX withdraw = ", supplyAmountDiff);
      this.withdrawService.withdrawIcx(Math.abs(supplyAmountDiff));
    }
    else {
      alert("No change in supplied value!");
      return;
    }
  }

  public depositUSDbAmountChange(): void {
    const amount = +usdbFormat.from(this.supplyDepositedBridge.value);
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.USDb) {
        this.supplyDepositedBridge.style.borderColor = "red";
      } else {
        this.supplyDepositedBridge.style.borderColor = "#c7ccd5";
      }
    }
  }

  public depositIcxAmountChange(): void {
    const amount = +icxFormat.from(this.supplyDepositedIcon.value);
    if (this.persistenceService.iconexWallet) {
      if (amount > this.persistenceService.iconexWallet.balances.ICX) {
        this.supplyDepositedIcon.style.borderColor = "red";
      } else {
        this.supplyDepositedIcon.style.borderColor = "#c7ccd5";
      }
    }
  }

  public borrowUSDbAmountChange(): void {
    this.borrowBorrowedBridge.value = +usdbFormat.from(this.borrowBorrowedBridge.value);
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

  // On "Bridge Dollars" click
  onAssetBridgeClick(): void {
    // Bridge slidedown
    $("#asset-bridge").toggleClass('active');
    $("#asset-bridge-expanded").slideToggle();

    // ICON slideup
    $("#asset-icon").removeClass('active');
    $("#asset-icon-expanded").slideUp();

    // TAP slideup
    $("#asset-tap").removeClass('active');
    $("#asset-tap-expanded").slideUp();

    // If "Supply" is in the "adjust" state, this will disable the state and reset the data
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");

      // Reset Bridge
      $('#supply-deposited').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      this.bridgeSupplySlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 1500);
      this.supplyAvailableBridge.value = usdbFormat.to((this.persistenceService.iconexWallet?.balances.USDb ?? 5000) +
        (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0));
      this.supplyDepositedBridge.value = usdbFormat.to(this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000);

      // Reset ICON
      $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconSupplySlider.toggleAttribute('disabled');
      this.iconSupplySlider.noUiSlider.set(this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 10000);
      this.supplyAvailableIcon.value = icxFormat.to((this.persistenceService.iconexWallet?.balances.ICX ?? 5000) +
        (this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 0));
      this.supplyDepositedIcon.value = icxFormat.to(this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 10000);

      // Reset TAP
      $('#supply-deposited-tap').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapSupplySlider.toggleAttribute('disabled');
      this.tapSupplySlider.noUiSlider.set(10000);
    }

    // If "Borrow" is in the "adjust" state, this will disable the state and reset the data
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");

      // Reset Bridge
      $('#borrow-borrowed').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      this.bridgeBorrowSlider.noUiSlider.set(this.persistenceService.userUSDbReserve?.currentBorrowBalance ?? 1500);

      // Reset ICON
      $('#borrow-borrowed-icon').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconBorrowSlider.toggleAttribute('disabled'); TODO
      this.iconBorrowSlider.noUiSlider.set(this.persistenceService.userIcxReserve?.currentBorrowBalance ?? 1500);

      // Reset TAP
      $('#borrow-borrowed-tap').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapBorrowSlider.toggleAttribute('disabled');
      this.tapBorrowSlider.noUiSlider.set(1500);
    }

    // Reset adjust
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");
  }

  // On "ICON" click
  public onAssetIconClick(): void {
    // Bridge slideup
    $("#asset-bridge").removeClass('active');
    $("#asset-bridge-expanded").slideUp();

    // ICON slidedown
    $("#asset-icon").toggleClass('active');
    $("#asset-icon-expanded").slideToggle();

    // TAP slideup
    $("#asset-tap").removeClass('active');
    $("#asset-tap-expanded").slideUp();

    // If "Supply" is in the "adjust" state, this will disable the state and reset the data
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");

      // Reset Bridge
      $('#supply-deposited-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-bridge').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      // this.bridgeSupplySlider.noUiSlider.set(10000);

      // Reset ICON
      $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconSupplySlider.toggleAttribute('disabled');
      // this.iconSupplySlider.noUiSlider.set(10000);

      // Reset TAP
      $('#supply-deposited-tap').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapSupplySlider.toggleAttribute('disabled');
      this.tapSupplySlider.noUiSlider.set(10000);
    }

    // If "Borrow" is in the "adjust" state, this will disable the state and reset the data
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");

      // Reset Bridge
      $('#borrow-borrowed-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-bridge').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      // this.bridgeBorrowSlider.noUiSlider.set(1500);

      // Reset ICON
      $('#borrow-borrowed-icon').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconBorrowSlider.toggleAttribute('disabled'); TODO
      // this.iconBorrowSlider.noUiSlider.set(1500);

      // Reset TAP
      $('#borrow-borrowed-tap').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapBorrowSlider.toggleAttribute('disabled');
      this.tapBorrowSlider.noUiSlider.set(1500);
    }

    // Reset adjust
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");
  }

  // On "TAP Tokens" click
  public onAssetTapClick(): void {
    // Bridge slideup
    $("#asset-bridge").removeClass('active');
    $("#asset-bridge-expanded").slideUp();

    // ICON slideup
    $("#asset-icon").removeClass('active');
    $("#asset-icon-expanded").slideUp();

    // TAP slidedown
    $("#asset-tap").toggleClass('active');
    $("#asset-tap-expanded").slideToggle();

    // If "Supply" is in the "adjust" state, this will disable the state and reset the data
    if ($("#supply").hasClass("adjust")) {
      $('#supply').removeClass("adjust");
      $('.supply-actions').toggleClass("hide");

      // Reset Bridge
      $('#supply-deposited-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-bridge').prop('disabled', (i: any, v: any) => !v);
      this.bridgeSupplySlider.toggleAttribute('disabled');
      // this.bridgeSupplySlider.noUiSlider.set(10000);

      // Reset ICON
      $('#supply-deposited-icon').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconSupplySlider.toggleAttribute('disabled');
      this.iconSupplySlider.noUiSlider.set(10000);

      // Reset TAP
      $('#supply-deposited-tap').prop('disabled', (i: any, v: any) => !v);
      $('#supply-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapSupplySlider.toggleAttribute('disabled');
      this.tapSupplySlider.noUiSlider.set(10000);
    }

    // If "Borrow" is in the "adjust" state, this will disable the state and reset the data
    if ($("#borrow").hasClass("adjust")) {
      $('#borrow').removeClass("adjust");
      $('.borrow-actions').toggleClass("hide");

      // Reset Bridge
      $('#borrow-borrowed-bridge').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-bridge').prop('disabled', (i: any, v: any) => !v);
      this.bridgeBorrowSlider.toggleAttribute('disabled');
      // this.bridgeBorrowSlider.noUiSlider.set(1500);

      // Reset ICON
      $('#borrow-borrowed-icon').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-icon').prop('disabled', (i: any, v: any) => !v);
      // this.iconBorrowSlider.toggleAttribute('disabled'); TODO
      // this.iconBorrowSlider.noUiSlider.set(1500);

      // Reset TAP
      $('#borrow-borrowed-tap').prop('disabled', (i: any, v: any) => !v);
      $('#borrow-available-tap').prop('disabled', (i: any, v: any) => !v);
      this.tapBorrowSlider.toggleAttribute('disabled');
      this.tapBorrowSlider.noUiSlider.set(1500);
    }

    // Reset adjust
    $('.supply').removeClass("adjust");
    $('.borrow').removeClass("adjust");
  }


  onMainClick(): void {
    $('#notifications-tooltip').removeClass("active");
    $('.notifications').removeClass("active");
    this.headerComponent.onMainClick();
  }

  getSupplyBridgeDifference(): number {
    return Math.abs(this.fromUSDbFormatToNumber(this.supplyDepositedBridge?.value) -
      this.persistenceService.getUserSuppliedUSDbBalance());
  }

  getBorrowBridgeDifference(): number {
    return Math.abs(this.persistenceService.getUserBorrowedUSDbBalance() -
      this.fromUSDbFormatToNumber(this.borrowBorrowedBridge?.value));
  }



}


