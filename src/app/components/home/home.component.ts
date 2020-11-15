import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence-service/persistence.service";
import {MockScoreService} from "../../services/mock-score/mock-score.service";
import {DepositService} from "../../services/deposit/deposit.service";
import {
  ommPrefixPlusFormat,
  percentageFormat,
  usdbFormat, usdbPrefixMinusFormat,
  usdbPrefixPlusFormat,
  usdFormat
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
      this.bridgeSupplySlider.noUiSlider.updateOptions({
        start: [userUSDbReserve.currentOTokenBalance]
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

    // Risk slider
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
    * Bridge supply slider
    */
    this.bridgeSupplySlider.noUiSlider.on('update', (values: { [x: string]: number; }, handle: string | number) => {
      // Supply deposited / available text boxes
      this.USDbDepositAmount = +values[handle];
      this.supplyDeposited.value = usdbFormat.to(values[handle] * 1);
      this.supplyAvailable.value = usdbFormat.to((this.persistenceService.iconexWallet?.balances.USDb ?? 15000) -
        (usdbFormat.from(this.supplyDeposited.value) - (this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0)));

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
      this.borrowAvailable.value = (usdbFormat.to(3300 - values[handle]));

      // Supply interest
      $('#borrow-interest').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));
      // Supply rewards
      $('#borrow-rewards').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));
      // Position borrow
      $('#position-borrow').text(usdFormat.to(values[handle] * 1));
      // Risk ratio
      this.riskRatio.noUiSlider.set(1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100);
      // Update risk percentage
      $('#risk-percentage-bridge').text(percentageFormat.to( 1 / ((usdbFormat.from(this.supplyDeposited.value) * 0.66) / usdbFormat.from(this.borrowBorrowed.value)) * 100));
      // Adjust locked indicator for collateral
      // document.getElementById("locked")!.style.left = (23 * (usdbFormat.from(this.borrowBorrowed.value) / 2053)) + "%";

    });
  }

  public onUSDbSupplyConfirmClick(): void {
    // check that value is not greater than user USDb balance
    if (this.persistenceService.iconexWallet) {
      if (this.USDbDepositAmount > this.persistenceService.iconexWallet.balances.USDb) {
        this.USDbDepositAmount = Math.floor(this.persistenceService.iconexWallet.balances.USDb);
        this.bridgeSupplySlider.noUiSlider.set(usdbFormat.to(this.USDbDepositAmount));
        return;
      }
    }
    const supplyAmountDiff = this.USDbDepositAmount - this.persistenceService.userUSDbReserve!.currentOTokenBalance
    if (supplyAmountDiff > 0) {
      console.log("Actual deposit = ", supplyAmountDiff)
      // deposit the amount - current supply
      this.depositService.depositUSDb(this.USDbDepositAmount - this.persistenceService.userUSDbReserve!.currentOTokenBalance);
    } else if (supplyAmountDiff < 0) {
      console.log("Actual withdraw = ", supplyAmountDiff)
      this.withdrawService.withdrawUSDb(Math.abs(supplyAmountDiff));
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
    $("#position-overview").slideToggle();
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


