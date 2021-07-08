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
import {Asset, AssetTag, assetToCollateralAssetTag} from "../../models/Asset";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalService} from "../../services/modal/modal.service";
import {ModalType} from "../../models/ModalType";
import {BaseClass} from "../base-class";
import {AssetAction} from "../../models/AssetAction";
import {NotificationService} from "../../services/notification/notification.service";
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
  _ommApyChecked = false;
  @Input() set ommApyChecked(ommApyChecked: boolean) {
    this._ommApyChecked = ommApyChecked;
    this.ommApyCheckedChange();
  }
  @Input() riskSlider!: any;
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

  constructor(private slidersService: SlidersService,
              public calculationService: CalculationsService,
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
  }

  ommApyCheckedChange(): void {
    // TODO trigger any potential logic needed
  }

  /**
   * On sign in to supply click
   */
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
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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
    this.addClass(this.borrowEl, "adjust");
    this.removeClass(this.supplyEl, "adjust");
    this.removeClass(this.supplyAction1El, "hide");
    this.addClass(this.supplyAction2El, "hide");
    this.addClass(this.borrowAction1El, "hide");
    this.removeClass(this.borrowAction2El, "hide");

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
    this.addClass(this.supplyEl, "adjust");
    this.removeClass(this.borrowEl, "adjust");
    this.addClass(this.supplyAction1El, "hide");
    this.removeClass(this.supplyAction2El, "hide");
    this.removeClass(this.borrowAction1El, "hide");
    this.addClass(this.borrowAction2El, "hide");

    /** Reset Borrow sliders */
    this.resetBorrowSliders();

    /** Reset Borrow inputs */
    this.resetBorrowInputs();

    /** Enable Supply inputs of asset-user */
    this.inputSupply.removeAttribute("disabled");
    this.sliderSupply.removeAttribute("disabled");
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
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));

    // disable inputs
    this.disableInputs();

    // Reset risk data
    this.updateRiskData();
  }

  /**
   * Logic to trigger on supply amount change after 1 sec of user keyup
   */
  onInputSupplyLostFocus(): void {
    this.delay(() => {
      const value = this.getInputSupplyValue();

      if (value > this.supplySliderMaxValue()) {
        this.inputSupply.classList.add("red-border");
      } else {
        // reset border color if it passes the check
        this.inputSupply.classList.remove("red-border");
        // set slider value
        this.setSupplySliderValue(value);
      }
    }, 500 );
  }

  /**
   * Logic to trigger on borrow amount change after 1 sec of user keyup
   */
  onInputBorrowLostFocus(): void {
    this.delay(() => {
      const value = this.getInputBorrowValue();

      if (value > this.borrowSliderMaxValue()) {
        this.inputBorrow.classList.add("red-border");
      } else {
        // reset border color if it passes the check
        this.inputBorrow.classList.remove("red-border");
        // set slider value
        this.setBorrowSliderValue(value);
      }
    }, 500 );
  }


  /**
   * Logic to trigger when user clicks confirm of asset-user supply
   */
  onAssetSupplyConfirmClick(): void {
    let value = this.roundDownTo2Decimals(this.getInputSupplyValue());
    log.debug(`Value: ${value}`);

    // check that supplied value is not greater than max
    const max = this.supplySliderMaxValue();
    if (value > max) {
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

      // full repayment
      if (after === 0) {
        amount = currentlyBorrowed;
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
    // create and set supply slider
    const supplied = this.getUserSuppliedAssetBalance();
    const suppliedMax = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    this.slidersService.createNoUiSlider(this.sliderSupply, supplied,
      undefined, undefined, undefined, {min: [0], max: [suppliedMax]});

    // create and set borrow slider
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
      this.setBorrowSliderValue(reserve.currentBorrowBalance);

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
      let value = this.deformatAssetValue(values[handle]);

      // in case of ICX leave 1 ICX for the fees
      if (this.asset.tag === AssetTag.ICX && value > this.supplySliderMaxValue() - 1) {
        value = this.supplySliderMaxValue() - 1;
      }

      // ensure it is rounded down
      value = this.roundDownTo2Decimals(value);

      // Update supplied text box
      this.inputSupply.value = assetFormat(this.asset.tag).to(value);

      // Update asset-user available text box
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(Utils.subtractDecimalsWithPrecision(
        this.supplySliderMaxValue(), value));

      // Update asset-user's supply interest
      this.setText(this.suppInterestEl, assetPrefixPlusFormat(this.asset.tag).to(this.getDailySupplyInterest(value)));

      const supplyDiff = Utils.subtractDecimalsWithPrecision(value, this.getUserSuppliedAssetBalance());

      // Update asset-user's supply omm rewards
      this.setText(this.suppRewardsEl, ommPrefixPlusFormat.to(this.calculationService.calculateUsersOmmRewardsForDeposit(
        this.asset.tag, value)));

      // update risk data
      let totalRisk;
      if (supplyDiff > 0) {
        totalRisk = this.updateRiskData(this.asset.tag, supplyDiff , UserAction.SUPPLY, false);
      } else if (supplyDiff < 0) {
        totalRisk = this.updateRiskData(this.asset.tag, Math.abs(supplyDiff) , UserAction.REDEEM, false);
      } else {
        totalRisk = this.updateRiskData();
      }

      this.setTmpRiskAndColor(totalRisk);

      // if total risk over 100%
      if (totalRisk > 0.99) {
        this.addClass(this.supplyAction2El, "hide");
        $('.value-risk-total').text("Max");
        $('.supply-risk-warning').css("display", "flex");
      } else {
        if ($(this.supplyEl).hasClass("adjust")) {
          this.addClass(this.supplyAction1El, "hide");
          this.removeClass(this.supplyAction2El, "hide");
          $('.supply-risk-warning').css("display", "none");
        } else {
          this.removeClass(this.supplyAction1El, "hide");
          this.addClass(this.supplyAction2El, "hide");
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

      const value = this.roundDownTo2Decimals(this.deformatAssetValue(values[handle], true));

      // stop slider on min (do not allow to go below "Used" repayment a.k.a user available balance of asset)
      if (this.isAssetBorrowUsed()) {
        const borrowUsed = this.borrowUsed();
        if (value < borrowUsed) {
          return this.setBorrowSliderValue(borrowUsed);
        }
      }

      // Update asset-user borrowed text box
      this.inputBorrow.value = assetFormat(assetToCollateralAssetTag(this.asset.tag)).to(value);

      // Update asset-user available text box
      this.inputBorrowAvailable.value = assetFormat(assetToCollateralAssetTag(this.asset.tag)).to(Utils.subtractDecimalsWithPrecision(
        this.borrowSliderMaxValue(), value));

      // Update asset-user's borrow interest
      this.setText(this.borrInterestEl, assetPrefixMinusFormat(assetToCollateralAssetTag(this.asset.tag)).to(
        this.getDailyBorrowInterest(value)));

      // Update asset-user's borrow omm rewards
      this.setText(this.borrRewardsEl, ommPrefixPlusFormat.to(this.calculationService.calculateUsersOmmRewardsForBorrow(
        this.asset.tag, value)));

      if (this.inputBorrow.value > 0) {
        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
      }

      const borrowDiff = Utils.subtractDecimalsWithPrecision(this.getUserBorrowedAssetBalance(), value);

      // update risk data
      let totalRisk;
      if (borrowDiff > 0) {
        totalRisk = this.updateRiskData(this.asset.tag, borrowDiff , UserAction.REPAY, false);
      } else if (borrowDiff < 0) {
        totalRisk = this.updateRiskData(this.asset.tag, Math.abs(borrowDiff) , UserAction.BORROW, false);
      } else {
        totalRisk = this.updateRiskData();
      }

      this.setTmpRiskAndColor(totalRisk);

      // if total risk over 100%
      if (totalRisk > 0.99) {
        this.addClass(this.borrowAction2El, "hide");
        $('.value-risk-total').text("Max");
        $('.borrow-risk-warning').css("display", "flex");
      } else if (totalRisk > 0.75) {
        this.addClass(this.borrowAction2El, "hide");
        $('.borrow-risk-warning').css("display", "flex");
        $('.value-risk-total').text(percentageFormat.to(totalRisk * 100));
      } else {
        if ($(this.borrowEl).hasClass("adjust")) {
          this.addClass(this.borrowAction1El, "hide");
          this.removeClass(this.borrowAction2El, "hide");
          $('.borrow-risk-warning').css("display", "none");
        } else {
          this.removeClass(this.borrowAction1El, "hide");
          this.addClass(this.borrowAction2El, "hide");
          $('.borrow-risk-warning').css("display", "none");
        }

        $('.value-risk-total').text(percentageFormat.to(totalRisk * 100));
      }

    });
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
    if (!value || value === 0) {
      return 0;
    }
    return this.isAssetIcx() ? this.convertSICXToICX(value) : value;
  }

  private setSupplySliderValue(value: number, convert = false): void {
    let res: number;
    // if asset is ICX, convert sICX -> ICX
    if (convert && this.isAssetIcx()) {
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

  private setBorrowSliderValue(value: number): void {
    const res = this.roundDownTo2Decimals(value);

    // if value is greater than slider max, update the sliders max and set the value
    if (res > this.borrowSliderMaxValue()) {
      this.sliderBorrow.noUiSlider.updateOptions({range: { min: 0, max: res }});
    }

    this.sliderBorrow.noUiSlider.set(res);
  }

  getUserSuppliedAssetBalance(): number {
    let res = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);

    if (this.isAssetIcx()) {
      res = this.convertSICXToICX(res);
    }

    return this.roundDownTo2Decimals(res);
  }

  getUserBorrowedAssetBalance(): number {
    return this.roundDownTo2Decimals(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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

    if (this.isAssetIcx()) {
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
    this.removeClass(this.supplyEl, "adjust");
    this.removeClass(this.borrowEl, "adjust");
  }

  showDefaultActions(): void {
    // Show default actions
    this.removeClass(this.supplyAction1El, "hide");
    this.removeClass(this.borrowAction1El, "hide");

    this.addClass(this.supplyAction2El, "hide");
    this.addClass(this.borrowAction2El, "hide");
  }

  resetBorrowSliders(): void {
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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
    this.inputBorrow.removeAttribute("disabled");
    this.sliderBorrow.removeAttribute("disabled");
    this.setBorrowSliderValue(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
  }

  hideAsset(): void {
    $(this.assetYourEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetYourEl).css("display", "table-row");
  }

  supplySliderMaxValue(): number {
    return this.sliderSupply?.noUiSlider?.options.range.max ?? 0;
  }

  borrowSliderMaxValue(): number {
    return this.sliderBorrow?.noUiSlider?.options.range.max ?? 0;
  }

  removeInputRedBorderClass(): void {
    // Remove red border class on input
    this.removeClass(this.inputSupply, "red-border");
    this.removeClass(this.inputBorrow, "red-border");
  }

  updateRiskData(assetTag?: AssetTag, diff?: number, userAction?: UserAction, updateState = true): number {
    const totalRisk = this.calculationService.calculateTotalRisk(assetTag, diff, userAction, updateState);
    // Update the risk slider
    this.riskSlider?.noUiSlider.set(totalRisk * 100);

    return totalRisk;
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

  getTotalAssetBorrows(): number {
    return this.persistenceService.getTotalAssetBorrows(this.asset.tag);
  }

  getTotalLiquidity(): number {
    const res = this.persistenceService.getAssetReserveData(this.asset.tag)?.totalLiquidity ?? 0;
    if (this.isAssetIcx()) {
      return this.convertSICXToICX(res);
    } else {
      return res;
    }
  }

  assetRepayUsedPercentage(): number {
    log.debug(`************ assetRepayUsedPercentage ************`);
    if (this.getUserBorrowedAssetBalance() <= 0){
      return 0;
    }

    // return in percentage how much is "used", i.e. how much in percentage user still has to repay
    // user can not scroll below this percentage on repayment / borrow slider
    const borrowUsed = this.borrowUsed();
    const percentageUsed = borrowUsed === 0 ? 0 : (borrowUsed / this.borrowSliderMaxValue()) * 100;
    log.debug(`assetRepayUsedPercentage for ${this.asset.tag} = ${percentageUsed}`);
    return percentageUsed;
  }

  borrowUsed(): number {
    const collateralAssetTag = assetToCollateralAssetTag(this.asset.tag);
    const userCollateralAssetBalance = this.persistenceService.getUserAssetCollateralBalance(collateralAssetTag);

    log.debug(`userCollateralAssetBalance for ${this.asset.tag} = ${userCollateralAssetBalance}`);
    const userAssetDebt = this.persistenceService.getUserAssetDebt(this.asset.tag);
    log.debug(`userAssetDebt for ${this.asset.tag} = ${userAssetDebt}`);

    // if user has balance of collateral asset greater than the debt he has to repay return 0
    // else return the amount that is outstanding (debt - balance)
    return userCollateralAssetBalance >= userAssetDebt ? 0 : Utils.subtractDecimalsWithPrecision(userAssetDebt, userCollateralAssetBalance);
  }

  // check if users balance is less than amount he has to repay
  isAssetBorrowUsed(): boolean {
    if (this.getUserBorrowedAssetBalance() <= 0){
      return false;
    }

    const collateralAssetTag = assetToCollateralAssetTag(this.asset.tag);

    return this.persistenceService.getUserAssetCollateralBalance(collateralAssetTag)
      < this.persistenceService.getUserAssetDebt(this.asset.tag);
  }

  isAllMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.ALL_MARKET;
  }

  getInputBorrowValue(): number {
    return +assetFormat(this.asset.tag).from(this.inputBorrow?.value ?? 0);
  }

  getInputSupplyValue(): number {
    return +assetFormat(this.asset.tag).from(this.inputSupply.value);
  }

  deformatAssetValue(value: any, convertToCollateralAsset = false): number {
    if (convertToCollateralAsset) {
      return +assetFormat(assetToCollateralAssetTag(this.asset.tag)).from(value);
    } else {
      return +assetFormat(this.asset.tag).from(value);
    }
  }

  shouldShowUnstaking(): boolean {
    const amount = this.persistenceService.userUnstakingInfo?.totalAmount ?? 0;
    return this.isAssetIcx() && amount > 0;
  }

  getMarketBorrowRate(): number {
    return this._ommApyChecked ? this.calculationService.calculateUserAndMarketReserveBorrowApy(this.asset.tag) :
      this.persistenceService.getAssetReserveData(this.asset.tag)?.borrowRate ?? 0;
  }

  getMarketSupplyRate(): number {
    return this._ommApyChecked ? this.calculationService.calculateUserAndMarketReserveSupplyApy(this.asset.tag) :
      this.persistenceService.getAssetReserveData(this.asset.tag)?.liquidityRate ?? 0;
  }

  getUserSupplyApy(): number | undefined {
    return this._ommApyChecked ? this.calculationService.getUserAssetSupplyApy(this.asset.tag, this._ommApyChecked) :
      this.persistenceService.getUserAssetReserve(this.asset.tag)?.liquidityRate;
  }

  getUserBorrowApy(): number {
    return this._ommApyChecked ? this.getUserAssetBorrowApy() : this.persistenceService.getUserAssetReserve(this.asset.tag)?.borrowRate
      ?? 0;
  }

  getAssetTagAdjusted(): string {
    if (this.isAssetIcx()) {
      return "ICX / sICX";
    } else {
      return this.asset.tag.toString();
    }
  }

  getBorrowAssetTagAdjusted(): string {
    if (this.isAssetIcx()) {
      return "sICX";
    } else {
      return this.asset.tag.toString();
    }
  }

  isAssetIcx(): boolean {
    return this.asset.tag === AssetTag.ICX;
  }

  getUserAssetBorrowApy(): number {
    return this.calculationService.getUserAssetBorrowApy(this.asset.tag, this._ommApyChecked);
  }

}
