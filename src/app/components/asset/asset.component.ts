import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SlidersService} from "../../services/sliders/sliders.service";
import {
  assetFormat,
  assetPrefixMinusFormat,
  assetPrefixPlusFormat,
  ommPrefixPlusFormat,
  percentageFormat
} from "../../common/formats";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {Asset, AssetTag} from "../../models/Asset";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalService} from "../../services/modal/modal.service";
import {ModalType} from "../../models/ModalType";
import {BaseClass} from "../base-class";
import {AssetAction} from "../../models/AssetAction";
import {NotificationService} from "../../services/notification/notification.service";
import {RiskCalculationData} from "../../models/RiskCalculationData";
import {UserAction} from "../../models/UserAction";
import {Utils} from "../../common/utils";
import {ActiveMarketView} from "../../models/ActiveMarketView";

declare var $: any;

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
})
export class AssetComponent extends BaseClass implements OnInit, AfterViewInit {

  @Input() asset!: Asset;
  @Input() index!: number;
  @Input() activeMarketView!: ActiveMarketView;

  /** Bind html elements to variables using template referencing */
  sliderSupply: any;
  @ViewChild("sliderSupply")set a(sliderSupply: ElementRef) {this.sliderSupply = sliderSupply.nativeElement; }
  sliderBorrow: any;
  @ViewChild("sliderBorrow") set b(sliderBorrow: ElementRef) {this.sliderBorrow = sliderBorrow.nativeElement; }
  supplyEl: any;
  @ViewChild("supply")set c(supplyEl: ElementRef) {this.supplyEl = supplyEl.nativeElement; }
  borrowEl: any;
  @ViewChild("borrow")set d(borrowEl: ElementRef) {this.borrowEl = borrowEl.nativeElement; }
  assetYourEl: any;
  @ViewChild("assetYour")set e(assetEl: ElementRef) { this.assetYourEl = assetEl.nativeElement; }
  marketExpandedEl: any;
  @ViewChild("marketExpandedEl")set f(marketExpandedEl: ElementRef) {this.marketExpandedEl = marketExpandedEl.nativeElement; }
  inputSupply: any;
  @ViewChild("inputSupply")set g(inputSupply: ElementRef) { this.inputSupply = inputSupply.nativeElement; }
  inputBorrow: any;
  @ViewChild("inputBorrow")set h(inputBorrow: ElementRef) { this.inputBorrow = inputBorrow.nativeElement; }
  inputSupplyAvailable: any;
  @ViewChild("inpSuppAvail")set i(inputSupplyAvailable: ElementRef) { this.inputSupplyAvailable = inputSupplyAvailable.nativeElement; }
  inputBorrowAvailable: any;
  @ViewChild("inpBorrAvail")set j(inputBorrowAvailable: ElementRef) { this.inputBorrowAvailable = inputBorrowAvailable.nativeElement; }
  supplyAction1El: any;
  @ViewChild("suppAct1") set k(suppAct1El: ElementRef) { this.supplyAction1El = suppAct1El.nativeElement; }
  borrowAction1El: any;
  @ViewChild("borrAct1") set l(borrAct1El: ElementRef) { this.borrowAction1El = borrAct1El.nativeElement; }
  supplyAction2El: any;
  @ViewChild("suppAct2") set m(suppAct2El: ElementRef) { this.supplyAction2El = suppAct2El.nativeElement; }
  borrowAction2El: any;
  @ViewChild("borrAct2") set n(borrAct2El: ElementRef) { this.borrowAction2El = borrAct2El.nativeElement; }
  suppInterestEl: any;
  @ViewChild("suppInterest") set o(suppInterest: ElementRef) { this.suppInterestEl = suppInterest.nativeElement; }
  borrInterestEl: any;
  @ViewChild("borrInterest") set p(borrInterest: ElementRef) { this.borrInterestEl = borrInterest.nativeElement; }
  suppRewardsEl: any;
  @ViewChild("suppRewards") set r(suppRewards: ElementRef) { this.suppRewardsEl = suppRewards.nativeElement; }
  borrRewardsEl: any;
  @ViewChild("borrRewards") set s(borrRewards: ElementRef) { this.borrRewardsEl = borrRewards.nativeElement; }

  @Output() collOtherAssetTables = new EventEmitter<AssetTag>();

  totalRisk = 0;
  sliderRisk: any;

  constructor(private slidersService: SlidersService,
              private calculationService: CalculationsService,
              private stateChangeService: StateChangeService,
              public persistenceService: PersistenceService,
              private modalService: ModalService,
              private notificationService: NotificationService) {
    super(persistenceService);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initSliders();
    this.initSupplySliderlogic();
    this.initBorrowSliderLogic();
    this.initSubscribedValues();
    this.subscribeToTotalRiskChange();

    this.sliderRisk = document.getElementById('slider-risk');
  }

  onSignInClick(): void {
    this.collapseAssetTableSlideUp();
    this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  /**
   * On Adjust cancel click
   */
  onAdjustCancelClick(): void {
    // Reset actions
    this.showDefaultActions();

    // Remove adjust
    this.removeAdjustClass();

    // Remove red border class on input
    this.removeInputRedBorderClass();

    // Reset user asset sliders
    this.setSupplySliderValue(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag), true);
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag), true);
    this.sliderSupply.setAttribute("disabled", "");
    this.sliderBorrow.setAttribute("disabled", "");

    // Reset risk data
    this.updateRiskData();

    // Disable asset-user inputs
    this.disableInputs();
  }

  /**
   * Borrow adjust
   */
  onBorrowAdjustClick(): void {
    /** Setup actions */
    $(this.borrowEl).addClass("adjust");
    $(this.supplyEl).removeClass("adjust");
    $(this.supplyAction1El).removeClass("hide");
    $(this.supplyAction2El).addClass("hide");
    $(this.borrowAction1El).addClass("hide");
    $(this.borrowAction2El).removeClass("hide");

    /** Reset Supply sliders */
    this.disableAndResetSupplySlider();

    /** Reset Supply inputs */
    this.resetSupplyInputs();

    /** Enable Borrow of asset-user */
    this.enableAssetBorrow();
  }

  /**
   * Supply adjust
   */
  onSupplyAdjustClick(): void {
    /** Setup actions */
    $(this.supplyEl).addClass("adjust");
    $(this.borrowEl).removeClass("adjust");
    $(this.supplyAction1El).addClass("hide");
    $(this.supplyAction2El).removeClass("hide");
    $(this.borrowAction1El).removeClass("hide");
    $(this.borrowAction2El).addClass("hide");

    /** Reset Borrow sliders */
    this.resetBorrowSliders();

    /** Reset Borrow inputs */
    this.resetBorrowInputs();

    /** Enable Supply inputs of asset-user */
    $(this.inputSupply).removeAttr("disabled");
    $(this.sliderSupply).removeAttr("disabled");
    this.setSupplySliderValue(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag), true);
  }


  /**
   * Asset expand logic
   */
  onAssetClick(): void {
    // reset sliders
    this.disableAndResetSupplySlider();
    this.disableAndResetBorrowSlider();

    /** Layout */

    if (this.index === 0) {
      // Expand asset-user table
      this.assetYourEl.classList.toggle('active');
      $(this.marketExpandedEl).slideToggle();
    }

    // Collapse other assets table
    this.collOtherAssetTables.emit(this.asset.tag);

    if (this.index !== 0) {
      this.assetYourEl.classList.toggle('active');
      $(this.marketExpandedEl).slideToggle();
    }


    /** Set everything to default */

    // Show default actions
    this.showDefaultActions();

    // Remove adjust class
    this.removeAdjustClass();

    // Remove red border class on input
    this.removeInputRedBorderClass();

    // Reset user asset sliders
    this.setSupplySliderValue(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag), true);
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag), true);

    // disable inputs
    this.disableInputs();

    // Reset risk data
    this.updateRiskData();
  }

  /**
   * Logic to trigger on supply amount change
   */
  supplyAssetAmountChange(): void {
    const value = this.getInputSupplyValue();

    if (this.persistenceService.activeWallet) {
      // check that supplied value is not greater than max
      if (value > this.supplySliderMaxValue()) {
        this.inputSupply.classList.add("red-border");
      } else {
        // set slider to this value and reset border color if it passes the check
        // this.setSupplySliderValue(value);
        this.inputSupply.classList.remove("red-border");
      }
    }
  }

  onInputSupplyLostFocus(): void {
    this.delay(() => {
      const value = this.getInputSupplyValue();
      this.setSupplySliderValue(value);
    }, 1000 );
  }

  /**
   * Logic to trigger on borrow amount change
   */
  public borrowAssetAmountChange(): void {
    const value = this.getInputBorrowValue();

    if (this.persistenceService.activeWallet) {
      // check that borrowed value is not greater than max
      if (value > this.borrowSliderMaxValue()) {
        log.debug(`Borrowed value=${value}  > max= ${this.borrowSliderMaxValue()}`);
        this.inputBorrow.classList.add("red-border");
      } else {
        // set slider to this value and reset border color if it passes the check
        this.setBorrowSliderValue(value);
        this.inputBorrow.classList.remove("red-border");
      }
    }
  }

  onInputBorrowLostFocus(): void {
    this.delay(() => {
      const value = this.getInputBorrowValue();
      this.setBorrowSliderValue(value);
    }, 1000 );
  }


  /**
   * Logic to trigger when user clicks confirm of asset-user supply
   */
  onAssetSupplyConfirmClick(): void {
    let value = this.roundDownTo2Decimals(this.getInputSupplyValue());

    log.debug("onAssetSupplyConfirmClick:");
    log.debug(`Value: ${value}`);

    // check that supplied value is not greater than max
    const max = this.supplySliderMaxValue();
    if (value > max) {
      log.error("Supply value = ", value);
      log.error("Max value = ", max);

      value = max;
      this.setSupplySliderValue(value);
      return;
    }

    const currentlySupplied = this.getUserSuppliedAssetBalance();
    log.debug(`Currently supplied (before): ${this.getUserSuppliedAssetBalance()}`);

    // calculate the difference and round down to 2 decimals
    const supplyAmountDiff = Utils.subtractDecimalsWithPrecision(value, currentlySupplied);
    log.debug(`supplyAmountDiff = ${supplyAmountDiff}`);

    const after = value;
    log.debug(`after = ${after}`);
    const amount = Math.abs(supplyAmountDiff);
    log.debug(`amount = ${amount}`);
    const risk = this.getCurrentDynamicRisk();

    if (supplyAmountDiff > 0) {
      this.modalService.showNewModal(ModalType.SUPPLY, new AssetAction(this.asset, currentlySupplied, after, amount, risk));
    } else if (supplyAmountDiff < 0) {
      this.modalService.showNewModal(ModalType.WITHDRAW, new AssetAction(this.asset, currentlySupplied, after, amount, risk));
    } else {
      this.notificationService.showNewNotification("No change in supplied value.");
      return;
    }
  }

  /**
   * Logic to trigger when user clicks confirm of asset-user borrow
   */
  onAssetBorrowConfirmClick(): void {
    let value = this.roundDownTo2Decimals(this.getInputBorrowValue());

    log.debug("onAssetBorrowConfirmClick:");
    log.debug(`Currently borrowed (before): ${this.getUserBorrowedAssetBalance()}`);
    log.debug(`Value: ${value}`);

    // check that borrowed value is not greater than max
    const max = this.borrowSliderMaxValue();
    if (value > max) {
      log.error("Borrow value = ", value);
      log.error("Max value = ", max);

      value = max;
      this.setBorrowSliderValue(value);
      return;
    }

    const currentlyBorrowed = this.getUserBorrowedAssetBalance();

    // calculate the difference and fix to 2 decimals
    const borrowAmountDiff = Utils.subtractDecimalsWithPrecision(value, currentlyBorrowed);
    log.debug(`borrowAmountDiff: ${borrowAmountDiff}`);

    const after = value;
    log.debug(`after: ${after}`);
    let amount = Math.abs(borrowAmountDiff);
    const risk = this.getCurrentDynamicRisk();

    if (borrowAmountDiff > 0) {
      this.modalService.showNewModal(ModalType.BORROW, new AssetAction(this.asset, currentlyBorrowed , after, amount, risk));
    } else if (borrowAmountDiff < 0) {

      // if full repayment
      if (after === 0) {
        amount = this.calculationService.totalRepaymentFormula(this.asset.tag);
      }

      this.modalService.showNewModal(ModalType.REPAY, new AssetAction(this.asset, currentlyBorrowed , after, amount, risk));
    }  else {
      this.notificationService.showNewNotification("No change in borrowed value.");
      return;
    }
  }

  /**
   * Supply / Borrow sliders
   */
  initSliders(): void {
    // set supply slider values
    const supplied = this.getUserSuppliedAssetBalance();
    const suppliedMax = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    this.slidersService.createNoUiSlider(this.sliderSupply, supplied,
      undefined, undefined, undefined, {min: [0], max: [suppliedMax]});

    // set borrow slider values
    const borrowed = this.getUserBorrowedAssetBalance();
    const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);

    // borrow max is either borrowed + available OR borrowed in case borrowAvailable is negative (risk > 76)
    const borrowMax = borrowAvailable > 0 ? Utils.addDecimalsPrecision(borrowed, borrowAvailable) : borrowed;
    this.slidersService.createNoUiSlider(this.sliderBorrow, borrowed, undefined, undefined, undefined,
      {min: [0], max: [this.getMaxBorrowAvailable(borrowMax)]});
  }

  /**
   * Handle variable/state changes for subscribed assets
   */
  initSubscribedValues(): void {
    // handle user assets balance changes
    this.subscribeToUserBalanceChange();

    // handle users assets reserve changes
    this.subscribeToUserAssetReserveChange();

    // handle user account data change
    this.subscribeToUserAccountDataChange();
  }

  private subscribeToTotalRiskChange(): void {
    // subscribe to total risk changes
    this.stateChangeService.userTotalRiskChange.subscribe(totalRisk => {
      // log.debug("Total risk change = " + totalRisk);
      this.totalRisk = totalRisk;
    });
  }

  public subscribeToUserAccountDataChange(): void {
    this.stateChangeService.userAccountDataChange.subscribe(userAccountData => {
      // set borrowed available value
      const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(borrowAvailable);

      // update asset borrow slider max value to  -> borrowed + borrow available
      let max = Utils.addDecimalsPrecision(this.getInputBorrowValue(), borrowAvailable);
      max = this.getMaxBorrowAvailable(max);
      this.sliderBorrow.noUiSlider.updateOptions({
        range: { min: 0, max: max === 0 ? 1 : max } // min and max must not equal
      });
    });
  }

  public subscribeToUserAssetReserveChange(): void {
    this.stateChangeService.userReserveChangeMap.get(this.asset.tag)!.subscribe((reserve: UserReserveData) => {
      log.debug(`${this.asset.tag} user reserve changed to: `, reserve);

      // update input supply available value to new users asset reserve balance
      const supplyAvailable = this.roundDownTo2Decimals(this.persistenceService.getUserAssetBalance(this.asset.tag));
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(supplyAvailable);

      // update supply slider value
      this.setSupplySliderValue(reserve.currentOTokenBalance, true);

      // update asset supply slider max value to  -> supplied + supplied available
      let max = Utils.addDecimalsPrecision(this.convertSICXToICXIfAssetIsICX(reserve.currentOTokenBalance), supplyAvailable);
      this.sliderSupply.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: max === 0 ? 1 : max // min and max must not equal
        }
      });

      // set borrowed available value
      const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(borrowAvailable);

      // set borrow slider value
      this.setBorrowSliderValue(reserve.currentBorrowBalance, true);

      // update asset borrow slider max value to  -> borrowed + borrow available
      max = Utils.addDecimalsPrecision(this.convertSICXToICXIfAssetIsICX(reserve.currentBorrowBalance), borrowAvailable);
      max = this.getMaxBorrowAvailable(max);
      this.sliderBorrow.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: max === 0 ? 1 : max // min and max must not equal
        }
      });
    });
  }

  public subscribeToUserBalanceChange(): void {
    // handle asset-user balance change
    this.stateChangeService.userBalanceChangeMap.get(this.asset.tag)!.subscribe(newBalance => {
      log.debug(`${this.asset.tag} balance changed to ${newBalance}`);
      newBalance = this.roundDownTo2Decimals(newBalance);

      if (this.sliderSupply) {
        this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(newBalance);

        const max = Utils.addDecimalsPrecision(newBalance, this.getUserSuppliedAssetBalance());
        this.sliderSupply.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: max === 0 ? 1 : max // min and max must not equal
          }
        });
      }
    });
  }

  /**
   * Supply slider logic
   */
  initSupplySliderlogic(): void {
    // On asset-user supply slider update (Your markets)
    this.sliderSupply.noUiSlider.on('update', (values: any, handle: any) => {
      const value = this.roundDownTo2Decimals(this.deformatAssetValue(values[handle]));
      // Update supplied text box
      this.inputSupply.value = assetFormat(this.asset.tag).to(value);

      // Update asset-user available text box
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(Utils.subtractDecimalsWithPrecision(
        this.supplySliderMaxValue(), value));

      // Update asset-user's supply interest
      $(this.suppInterestEl).text(assetPrefixPlusFormat(this.asset.tag).to(this.getDailySupplyInterest(value)));

      const supplyDiff = Utils.subtractDecimalsWithPrecision(value, this.getUserSuppliedAssetBalance());

      // Update asset-user's supply omm rewards
      $(this.suppRewardsEl).text(ommPrefixPlusFormat.to(this.calculationService.calculateUsersOmmRewardsForDeposit(
        this.asset.tag, value)));

      // update risk data
      let riskCalculationData;
      if (supplyDiff > 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, supplyDiff , UserAction.SUPPLY);
      } else if (supplyDiff < 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, Math.abs(supplyDiff) , UserAction.REDEEM);
      }

      const totalRisk = this.updateRiskData(riskCalculationData, false);

      this.setTmpRiskAndColor(totalRisk);

      // if total risk over 100%
      if (totalRisk > 0.99) {
        $(this.supplyAction2El).addClass("hide");
        $('.value-risk-total').text("Max");
        $('.supply-risk-warning').css("display", "flex");
      } else {
        if ($(this.supplyEl).hasClass("adjust")) {
          $(this.supplyAction1El).addClass("hide");
          $(this.supplyAction2El).removeClass("hide");
          $('.supply-risk-warning').css("display", "none");
        } else {
          $(this.supplyAction1El).removeClass("hide");
          $(this.supplyAction2El).addClass("hide");
          $('.supply-risk-warning').css("display", "none");
        }
      }

    });
  }

  /**
   * Borrow slider logic
   */
  initBorrowSliderLogic(): void {
    // On asset-user borrow slider update (Your markets)
    this.sliderBorrow.noUiSlider.on('update', (values: any, handle: any) => {
      const value = this.roundDownTo2Decimals(this.deformatAssetValue(values[handle]));
      // Update asset-user borrowed text box
      this.inputBorrow.value = this.roundDownTo2Decimals(value);
      // const convertedValue = this.convertSliderValue(value);

      // Update asset-user available text box
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(Utils.subtractDecimalsWithPrecision(
        this.borrowSliderMaxValue(), value));

      // Update asset-user's borrow interest
      $(this.borrInterestEl).text(assetPrefixMinusFormat(this.asset.tag).to(this.getDailyBorrowInterest(value)));

      // Update asset-user's borrow omm rewards
      $(this.borrRewardsEl).text(ommPrefixPlusFormat.to(this.calculationService.calculateUsersOmmRewardsForBorrow(
        this.asset.tag, value)));

      if (this.inputBorrow.value > 0) {
        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
      }

      // const borrowDiff = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag) - convertedValue;
      const borrowDiff = Utils.subtractDecimalsWithPrecision(this.getUserBorrowedAssetBalance(), value);

      // update risk data
      let riskCalculationData;

      if (borrowDiff > 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, borrowDiff , UserAction.REPAY);
      } else if (borrowDiff < 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, Math.abs(borrowDiff) , UserAction.BORROW);
      }

      const totalRisk = this.updateRiskData(riskCalculationData, false);

      this.setTmpRiskAndColor(totalRisk);

      // if total risk over 100%
      if (totalRisk > 0.99) {
        $(this.borrowAction2El).addClass("hide");
        $('.value-risk-total').text("Max");
        $('.borrow-risk-warning').css("display", "flex");
      } else if (totalRisk > 0.75) {
        $(this.borrowAction2El).addClass("hide");
        $('.borrow-risk-warning').css("display", "flex");
        $('.value-risk-total').text(percentageFormat.to(totalRisk * 100));
      } else {
        if ($(this.borrowEl).hasClass("adjust")) {
          $(this.borrowAction1El).addClass("hide");
          $(this.borrowAction2El).removeClass("hide");
          $('.borrow-risk-warning').css("display", "none");
        } else {
          $(this.borrowAction1El).removeClass("hide");
          $(this.borrowAction2El).addClass("hide");
          $('.borrow-risk-warning').css("display", "none");
        }

        $('.value-risk-total').text(percentageFormat.to(totalRisk * 100));
      }

    });
  }

  convertSliderValue(value: number): number {
    if (this.asset.tag === AssetTag.ICX) {
      return this.convertFromICXTosICX(value);
    } else {
      return value;
    }
  }

  setTmpRiskAndColor(totalRisk: number): void {
    const valueRiskTotal = $('.value-risk-total');

    valueRiskTotal.text(percentageFormat.to(totalRisk * 100));

    // Change text to purple if over 50
    if (totalRisk > 0.50) {
      valueRiskTotal.addClass("alert-purple");
    }

    // Remove purple if below 50
    if (totalRisk < 0.50) {
      valueRiskTotal.removeClass("alert-purple");
    }

    // Change text to red if over 75
    if (totalRisk > 0.75) {
      valueRiskTotal.addClass("alert");
    }

    // Change text to normal if under 75
    if (totalRisk < 0.75) {
      valueRiskTotal.removeClass("alert");
    }
  }

  getCurrentDynamicRisk(): number {
    return +percentageFormat.from($('.value-risk-total').text());
  }

  private convertSICXToICXIfAssetIsICX(value: number): number {
    return this.asset.tag === AssetTag.ICX ? this.convertSICXToICX(value) : value;
  }

  private setSupplySliderValue(value: number, convert = false): void {
    let res: number;
    // if asset is ICX, convert sICX -> ICX
    if (convert && this.asset.tag === AssetTag.ICX) {
      res = this.roundDownTo2Decimals(this.convertSICXToICX(value));
    } else {
      res = this.roundDownTo2Decimals(value);
    }

    // if value is greater than slider max, update the sliders max and set the value
    if (res > this.supplySliderMaxValue()) {
      this.sliderSupply.noUiSlider.updateOptions({range: { min: 0, max: res }});
      this.sliderSupply.noUiSlider.set(res);
    }

    this.sliderSupply.noUiSlider.set(res);
  }

  private setBorrowSliderValue(value: number, convert = false): void {
    let res: number;
    // if asset is ICX, convert sICX -> ICX
    if (convert && this.asset.tag === AssetTag.ICX) {
      res = this.roundDownTo2Decimals(this.convertSICXToICX(value));
    } else {
      res = this.roundDownTo2Decimals(value);
    }

    // if value is greater than slider max, update the sliders max and set the value
    if (res > this.borrowSliderMaxValue()) {
      this.sliderBorrow.noUiSlider.updateOptions({range: { min: 0, max: res }});
    }

    this.sliderBorrow.noUiSlider.set(res);
  }

  getUserSuppliedAssetBalance(): number {
    let res = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);

    if (this.asset.tag === AssetTag.ICX) {
      res = this.convertSICXToICX(res);
    }

    return this.roundDownTo2Decimals(res);
  }

  getUserBorrowedAssetBalance(): number {
    let res = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag);

    if (this.asset.tag === AssetTag.ICX) {
      res = this.convertSICXToICX(res);
    }

    return this.roundDownTo2Decimals(res);
  }

  getUserSuppliableBalanceUSD(): number {
    return this.persistenceService.getUserAssetUSDBalance(this.asset.tag);
  }

  getUserSuppliableBalance(): number {
    return this.persistenceService.getUserAssetBalance(this.asset.tag);
  }

  // show user asset if is either supplied, available to supply, borrowed or available to borrow
  shouldBeShown(): boolean {
    if (this.isAllMarketViewActive()) {
      return true;
    } else {
      return !this.persistenceService.userAssetSuppliedIsZero(this.asset.tag)
        || this.persistenceService.isAssetAvailableToSupply(this.asset.tag)
        || !this.persistenceService.userAssetBorrowedIsZero(this.asset.tag)
        || (this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag) > 0);
    }
  }

  getDailySupplyInterest(amountBeingSupplied?: number): number {
    return this.calculationService.calculateUsersDailySupplyInterestForAsset(this.asset.tag, amountBeingSupplied);
  }

  getDailyBorrowInterest(amountBeingBorrowed?: number): number {
    return this.calculationService.calculateUsersDailyBorrowInterestForAsset(this.asset.tag, amountBeingBorrowed);
  }

  userAssetBalanceIsZero(): boolean {
    return this.persistenceService.userAssetBalanceIsZero(this.asset.tag);
  }

  userAssetSuppliedBalanceIsZero(): boolean {
    return this.persistenceService.userAssetSuppliedIsZero(this.asset.tag);
  }

  userAssetBorrowedBalanceIsZero(): boolean {
    return this.persistenceService.userAssetBorrowedIsZero(this.asset.tag);
  }

  getMaxBorrowAvailable(suggestedMax: number): number {
    // take either suggested on or asset totalSupplied - totalBorrowed + currentBorrow
    const totalSupplied = this.persistenceService.getAssetReserveData(this.asset.tag)?.totalLiquidity ?? 0;
    const totalBorrowed = this.persistenceService.getAssetReserveData(this.asset.tag)?.totalBorrows ?? 0;
    const currentBorrow = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag) ?? 0;
    let availTotalBorrow = totalSupplied - totalBorrowed + currentBorrow;

    if (this.asset.tag === AssetTag.ICX) {
      availTotalBorrow = this.convertSICXToICX(availTotalBorrow);
    }

    return this.roundDownTo2Decimals(Math.min(suggestedMax, availTotalBorrow));
  }

  collapseAssetTableSlideUp(): void {
    // Collapse asset-user table`
    this.assetYourEl.classList.remove('active');
    $(this.marketExpandedEl).slideUp();
  }

  collapseAssetTable(): void {
    log.debug(`${this.asset.tag} collapseAssetTable()`);
    // Collapse asset-user table`
    this.assetYourEl.classList.remove('active');
    $(this.marketExpandedEl).hide();
  }

  hideAvailableAssetData(): void {
    // Hide available assets data
    $(this.assetYourEl).css("display", "none");
  }

  showAssetAvailableAndHideAssetYour(): void {
    // Hide your asset-user version
    $(this.assetYourEl).css("display", "none");
  }

  removeAdjustClass(): void {
    // Remove adjust class
    $(this.supplyEl).removeClass("adjust");
    $(this.borrowEl).removeClass("adjust");
  }

  showDefaultActions(): void {
    // Show default actions
    $(this.supplyAction1El).removeClass("hide");
    $(this.borrowAction1El).removeClass("hide");

    $(this.supplyAction2El).addClass("hide");
    $(this.borrowAction2El).addClass("hide");
  }

  resetBorrowSliders(): void {
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag), true);
    this.sliderBorrow.setAttribute("disabled", "");
  }

  resetBorrowInputs(): void {
    $(this.inputBorrow).attr('disabled', 'disabled');
    $(this.inputBorrowAvailable).attr('disabled', 'disabled');
  }

  resetSupplyInputs(): void {
    $(this.inputSupply).attr('disabled', 'disabled');
    $(this.inputSupplyAvailable).attr('disabled', 'disabled');
  }

  disableAndResetSupplySlider(): void {
    // Disable asset-user supply sliders (Your markets)
    this.setSupplySliderValue(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag), true);
    this.sliderSupply.setAttribute("disabled", "");
  }

  disableAndResetBorrowSlider(): void {
    // Disable asset-user borrow sliders (Your markets)
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag), true);
    this.sliderBorrow.setAttribute("disabled", "");
  }


  disableInputs(): void {
    // Disable asset-user inputs (Your markets)
    $(this.inputSupply).attr('disabled', 'disabled');
    $(this.inputSupplyAvailable).attr('disabled', 'disabled');
    $(this.inputBorrow).attr('disabled', 'disabled');
    $(this.inputBorrowAvailable).attr('disabled', 'disabled');
  }

  enableAssetBorrow(): void {
    $(this.inputBorrow).removeAttr("disabled");
    $(this.sliderBorrow).removeAttr("disabled");
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag), true);
  }

  hideAsset(): void {
    $(this.assetYourEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetYourEl).css("display", "table-row");
  }

  supplySliderMaxValue(): number {
    return this.sliderSupply.noUiSlider.options.range.max;
  }

  borrowSliderMaxValue(): number {
    return this.sliderBorrow.noUiSlider.options.range.max;
  }

  removeInputRedBorderClass(): void {
    // Remove red border class on input
    this.inputSupply.classList.remove("red-border");
    this.inputBorrow.classList.remove("red-border");
  }

  updateRiskData(riskCalculationData?: RiskCalculationData, updateState = true): number {
    const totalRisk = this.calculationService.calculateTotalRisk(riskCalculationData, updateState);
    // Update the risk slider
    if (this.sliderRisk) {
      this.sliderRisk.noUiSlider.set(totalRisk * 100);
    }

    return this.calculationService.calculateTotalRisk(riskCalculationData, updateState);
  }

  isAssetAvailable(): boolean {
    return this.persistenceService.isAssetAvailableToSupply(this.asset.tag);
  }

  getAssetClass(): string {
    if (this.activeMarketView === ActiveMarketView.USER_MARKET) {
      return this.isAssetAvailable() ? 'asset-available' : 'your';
    } else {
      return "all";
    }
  }

  getTotalBorrows(): number {
    const res = this.persistenceService.getAssetReserveData(this.asset.tag)?.totalBorrows ?? 0;
    if (this.asset.tag === AssetTag.ICX) {
      return this.convertSICXToICX(res);
    } else {
      return res;
    }
  }

  getTotalLiquidity(): number {
    const res = this.persistenceService.getAssetReserveData(this.asset.tag)?.totalLiquidity ?? 0;
    if (this.asset.tag === AssetTag.ICX) {
      return this.convertSICXToICX(res);
    } else {
      return res;
    }
  }

  isAllMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.ALL_MARKET;
  }

  getInputBorrowValue(): number {
    return +assetFormat(this.asset.tag).from(this.inputBorrow.value);
  }

  getInputSupplyValue(): number {
    return +assetFormat(this.asset.tag).from(this.inputSupply.value);
  }

  deformatAssetValue(value: any): number {
    return +assetFormat(this.asset.tag).from(value);
  }

}
