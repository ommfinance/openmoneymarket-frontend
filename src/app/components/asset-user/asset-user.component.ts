import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SlidersService} from "../../services/sliders/sliders.service";
import {
  assetFormat, assetPrefixMinusFormat, assetPrefixPlusFormat,
  ommPrefixPlusFormat
} from "../../common/formats";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {Asset, AssetTag} from "../../models/Asset";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalService} from "../../services/modal/modal.service";
import {Modals} from "../../models/Modals";
import {OmmError} from "../../core/errors/OmmError";
import {BaseClass} from "../base-class";
import {AssetAction} from "../../models/AssetAction";
import {NotificationService} from "../../services/notification/notification.service";
import {RiskData} from "../../models/RiskData";

declare var $: any;

@Component({
  selector: 'app-asset-user',
  templateUrl: './asset-user.component.html',
})
export class AssetUserComponent extends BaseClass implements OnInit, AfterViewInit {

  @Input() asset!: Asset;
  @Input() index!: number;

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
  @Output() disableAndResetSliders = new EventEmitter<undefined>();
  @Output() disableAssetsInputs = new EventEmitter<undefined>();
  @Output() updateRiskData = new EventEmitter<RiskData | undefined>();

  constructor(private slidersService: SlidersService,
              private calculationService: CalculationsService,
              private stateChangeService: StateChangeService,
              public persistenceService: PersistenceService,
              private modalService: ModalService,
              private notificationService: NotificationService) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initSliders();
    this.initSupplySliderlogic();
    this.initBorrowSliderLogic();
    this.initSubscribedValues();
  }

  /**
   * On Adjust cancel click
   */
  onAdjustCancelClick(): void {
    // Reset actions
    $('.actions-2').addClass("hide");
    $('.actions-1').removeClass("hide");

    // Remove adjust
    $(this.supplyEl).removeClass("adjust");
    $(this.borrowEl).removeClass("adjust");

    // Reset user asset sliders
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
    this.sliderSupply.setAttribute("disabled", "");
    this.sliderBorrow.setAttribute("disabled", "");

    // Reset risk data
    // this.updateRiskData.emit(); // TODO

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
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
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
      $(`.asset.${this.asset.tag}`).toggleClass('active');
      $(this.marketExpandedEl).slideToggle();
    }

    // Collapse other assets table
    this.collOtherAssetTables.emit(this.asset.tag);

    if (this.index !== 0) {
      $(`.asset.${this.asset.tag}`).toggleClass('active');
      $(this.marketExpandedEl).slideToggle();
    }


    /** Set everything to default */

    // Remove adjust class
    this.removeAdjustClass();

    // Show default actions
    this.showDefaultActions();

    // Disable and reset asset-user supply and borrow sliders (Your markets)
    this.disableAndResetSliders.emit(undefined);

    // Reset risk data
    // this.updateRiskData.emit(); TODO

    // Disable Asset inputs
    this.disableAssetsInputs.emit(undefined);
  }

  /**
   * Logic to trigger on supply amount change
   */
  supplyAssetAmountChange(): void {
    const amount = +assetFormat(this.asset.tag).from(this.inputSupply.value);

    // update risk data TODO
    // const supplyDiff = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) - amount;
    // const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, supplyDiff, undefined));
    // this.updateRiskData.emit(riskData);

    if (this.persistenceService.activeWallet) {
      if (amount > this.persistenceService.activeWallet.balances.get(this.asset.tag)!) {
        this.inputSupply.style.borderColor = "red";
      } else {
        this.inputSupply.style.borderColor = "#c7ccd5";
      }
    }
  }

  /**
   * Logic to trigger on borrow amount change
   */
  public borrowAssetAmountChange(): void {
    const amount = +assetFormat(this.asset.tag).from(this.inputBorrow.value);

    // update risk data TODO
    // const borrowDiff = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag) - amount;
    // const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, undefined, borrowDiff));
    // this.updateRiskData.emit(riskData);

    if (this.persistenceService.activeWallet) {
      if (amount > +assetFormat(this.asset.tag).from(this.inputBorrowAvailable.value)) {
        this.inputBorrow.style.borderColor = "red";
      } else {
        this.inputBorrow.style.borderColor = "#c7ccd5";
      }
    }
  }


  /**
   * Logic to trigger when user clicks confirm of asset-user supply
   */
  onAssetSupplyConfirmClick(): void {
    let value = +this.inputSupply.value;
    log.debug(`Supply of ${this.asset.tag} changed to ${value}`);

    // check that supplied value is not greater than max
    const max = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    if (value > max) {
      value = max;
      this.sliderSupply.noUiSlider.set(value);
      throw new OmmError(`Supplied value greater than ${this.asset.tag} balance.`);
    }

    const currentSupply = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);
    log.debug(`currentSupply = ${currentSupply}`);
    const supplyAmountDiff = value - currentSupply;
    log.debug(`supplyAmountDiff = ${supplyAmountDiff}`);

    const before = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);
    const amount = Math.abs(supplyAmountDiff);

    if (supplyAmountDiff > 0) {
      this.modalService.showNewModal(Modals.SUPPLY, new AssetAction(this.asset, before , value, amount));
    } else if (supplyAmountDiff < 0) {
      this.modalService.showNewModal(Modals.WITHDRAW, new AssetAction(this.asset, before , value, amount));
    } else {
      this.notificationService.showNewNotification("No change in supplied value.");
      return;
    }
  }

  /**
   * Logic to trigger when user clicks confirm of asset-user borrow
   */
  onAssetBorrowConfirmClick(): void {
    const value = +assetFormat(this.asset.tag).from(this.inputBorrow.value);
    const borrowAmountDiff = value - Math.floor(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
  // TODO add check

    const before = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag);
    const amount = Math.floor(Math.abs(borrowAmountDiff));
    if (borrowAmountDiff > 0) {
      this.modalService.showNewModal(Modals.BORROW, new AssetAction(this.asset, before , value, amount));
    } else if (borrowAmountDiff < 0) {
      this.modalService.showNewModal(Modals.REPAY, new AssetAction(this.asset, before , value, amount));
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
    const supplied = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);
    const suppliedMax = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    this.slidersService.createNoUiSlider(this.sliderSupply, supplied,
      undefined, undefined, undefined, {min: [0], max: [suppliedMax]});

    // set borrow slider values
    const borrowed = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag);
    const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);
    const borrowMax = borrowed + borrowAvailable;
    log.debug("borrowed=" + borrowed);
    log.debug("borrowAvailable=" + borrowAvailable);
    log.debug("borrowMax=" + borrowMax);
    this.slidersService.createNoUiSlider(this.sliderBorrow, borrowed, undefined, undefined, undefined,
      {min: [0], max: [borrowMax]});
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

  public subscribeToUserAccountDataChange(): void {
    this.stateChangeService.userAccountDataChange.subscribe(userAccountData => {
      // set borrowed available value
      const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(borrowAvailable);

      // update asset borrow slider max value to  -> borrowed + borrow available
      const max = +this.inputBorrow.value + borrowAvailable;
      this.sliderBorrow.noUiSlider.updateOptions({
        range: { min: 0, max: max === 0 ? 1 : max } // min and max must not equal
      });
    });
  }

  public subscribeToUserAssetReserveChange(): void {
    this.stateChangeService.userReserveChangeMap.get(this.asset.tag)!.subscribe((reserve: UserReserveData) => {
      log.debug(`${this.asset.tag} reserve changed to: `, reserve);

      // supplied asset balance
      const supplied = reserve.currentOTokenBalance ?? 0;

      // update input supply value to new asset-user reserve balance
      this.inputSupply.value = assetFormat(this.asset.tag).to(supplied);

      // update input supply available value to new users asset reserve balance
      const supplyAvailable = this.calculationService.calculateAssetSliderAvailableSupply(supplied, this.asset.tag);
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(supplyAvailable);

      // update supply slider value
      this.sliderSupply.noUiSlider.set(supplied);

      // update asset supply slider max value to  -> supplied + supplied available
      let max = supplied + supplyAvailable;
      this.sliderSupply.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: max === 0 ? 1 : max // min and max must not equal
        }
      });
      // set borrow supplied and slider value
      const borrowed = reserve.principalBorrowBalance;

      // set borrowed value
      this.inputBorrow.value = assetFormat(this.asset.tag).to(borrowed);

      // set borrowed available value
      const borrowAvailable = this.calculationService.calculateAvailableBorrowForAsset(this.asset.tag);
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(borrowAvailable);

      // set borrow slider value
      this.sliderBorrow.noUiSlider.set(borrowed);

      // update asset borrow slider max value to  -> borrowed + borrow available
      max = borrowed + borrowAvailable;
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
      if (this.sliderSupply) {
        this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(newBalance);
        const max = newBalance + (this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) ?? 0);
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
      const value = +values[handle];
      // Update supplied text box
      this.inputSupply.value = value;
      const supplyDiff = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) - this.inputSupply.value;

      // Update asset-user available text box
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(this.sliderSupply.noUiSlider.options.range.max - value);

      // Update asset-user's supply interest
      $(this.suppInterestEl).text(assetPrefixPlusFormat(this.asset.tag).to(
        this.calculationService.calculateUsersDailySupplyInterestForAsset(this.asset.tag, value)));

      // Update asset-user's supply omm rewards // TODO
      $(this.suppRewardsEl).text(ommPrefixPlusFormat.to((parseFloat(values[handle])) * 0.447 / 365));

      // update risk data TODO
      // const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, supplyDiff, undefined));
      // this.updateRiskData.emit(riskData);
    });
  }

  /**
   * Borrow slider logic
   */
  initBorrowSliderLogic(): void {
    // On asset-user borrow slider update (Your markets)
    this.sliderBorrow.noUiSlider.on('update', (values: any, handle: any) => {
      const value = parseFloat(values[handle]);
      // Update asset-user borrowed text box
      this.inputBorrow.value = (value);
      const borrowDiff = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag) - this.inputBorrow.value;

      // Update asset-user available text box
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(this.sliderBorrow.noUiSlider.options.range.max - value);

      // Update asset-user's borrow interest
      $(this.borrInterestEl).text(assetPrefixMinusFormat(this.asset.tag).to(
        this.calculationService.calculateUsersDailyBorrowInterestForAsset(this.asset.tag, value)));

      // Update asset-user's borrow omm rewards
      $(this.borrRewardsEl).text(ommPrefixPlusFormat.to(value * 0.4725 / 365)); // TODO

      // update risk data TODO
      // const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, undefined, borrowDiff));
      // this.updateRiskData.emit(riskData);

      if (this.inputBorrow.value > 0) {
        // show risk data
        $('.risk-container').css("display", "block");

        // Hide risk message
        $('.risk-message-noassets').css("display", "none");
      }
    });
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

  collapseAssetTableSlideUp(): void {
    // Collapse asset-user table`
    $(`.asset.${this.asset.tag}`).removeClass('active');
    $(this.marketExpandedEl).slideUp();
  }

  collapseAssetTable(): void {
    // Collapse asset-user table`
    $(`.asset.${this.asset.tag}`).removeClass('active');
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
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
    this.sliderSupply.setAttribute("disabled", "");
  }

  disableAndResetBorrowSlider(): void {
    // Disable asset-user borrow sliders (Your markets)
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
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
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
  }

  hideAsset(): void {
    $(this.assetYourEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetYourEl).css("display", "table-row");
  }

}
