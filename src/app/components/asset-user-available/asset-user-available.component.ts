import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {Asset, AssetTag} from "../../models/Asset";
import {RiskData} from "../../models/RiskData";
import {SlidersService} from "../../services/sliders/sliders.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalService} from "../../services/modal/modal.service";
import {NotificationService} from "../../services/notification/notification.service";
import log from "loglevel";
import {assetFormat, assetPrefixPlusFormat, ommPrefixPlusFormat} from "../../common/formats";
import {OmmError} from "../../core/errors/OmmError";
import {Modals} from "../../models/Modals";
import {AssetAction} from "../../models/AssetAction";
import {UserReserveData} from "../../models/UserReserveData";
import {RiskCalculationData} from "../../models/RiskCalculationData";
import {UserAction} from "../../models/UserAction";

declare var $: any;

@Component({
  selector: 'app-asset-available',
  templateUrl: './asset-user-available.component.html',
})
export class AssetUserAvailableComponent extends BaseClass implements OnInit, AfterViewInit {

  @Input() asset!: Asset;
  @Input() index!: number;

  @ViewChild("sliderSupply")set sliderSupplySetter(sliderSupply: ElementRef) {this.sliderSupply = sliderSupply.nativeElement; }
  @ViewChild("supply")set supplyElSetter(supplyEl: ElementRef) {this.supplyEl = supplyEl.nativeElement; }
  @ViewChild("borrow")set borrowElSetter(borrowEl: ElementRef) {this.borrowEl = borrowEl.nativeElement; }
  @ViewChild("marketExpandedEl")set marketExpandedElSetter(marketExpandedEl: ElementRef) {this.marketExpandedEl = marketExpandedEl.nativeElement; }
  @ViewChild("inputSupply")set inputSupplySetter(inputSupply: ElementRef) { this.inputSupply = inputSupply.nativeElement; }
  @ViewChild("inpSuppAvail")set inputSupplyAvailableSetter(inputSupplyAvailable: ElementRef) { this.inputSupplyAvailable = inputSupplyAvailable.nativeElement; }
  @ViewChild("assetAvail")set assetAvailableSetter(assetAvailableEl: ElementRef) { this.assetAvailableEl = assetAvailableEl.nativeElement; }
  @ViewChild("suppAct1") set supplyAction1(suppAct1El: ElementRef) { this.supplyAction1El = suppAct1El.nativeElement; }
  @ViewChild("suppAct2") set supplyAction2(suppAct2El: ElementRef) { this.supplyAction2El = suppAct2El.nativeElement; }
  @ViewChild("suppInterest") set suppInterestSetter(suppInterest: ElementRef) { this.suppInterestEl = suppInterest.nativeElement; }
  @ViewChild("suppRewards") set suppRewardsSetter(suppRewards: ElementRef) { this.suppRewardsEl = suppRewards.nativeElement; }

  suppInterestEl: any;
  suppRewardsEl: any;

  supplyAction1El: any;
  supplyAction2El: any;

  sliderSupply: any;

  // elements
  supplyEl: any;
  borrowEl: any;
  marketExpandedEl: any;
  assetAvailableEl: any;

  // inputs
  inputSupply: any;
  inputSupplyAvailable: any;

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
    this.removeAdjustClass();

    // Remove red border class
    this.removeInputRedBorderClass();

    // Reset asset-user sliders
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
    this.sliderSupply.setAttribute("disabled", "");

    // Reset risk data
    this.updateRiskData.emit();

    // Disable asset-user inputs
    this.disableInputs();
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

    // Remove red border class
    this.removeInputRedBorderClass();

    // Show default actions
    this.showDefaultActions();

    // Disable and reset asset-user supply and borrow sliders (Your markets)
    this.disableAndResetSliders.emit(undefined);

    // Reset risk data
    this.updateRiskData.emit();

    // Disable USDb inputs
    this.disableAssetsInputs.emit(undefined);
  }

  /**
   * Logic to trigger on supply amount change
   */
  supplyAssetAmountChange(): void {
    const value = +assetFormat(this.asset.tag).from(this.inputSupply.value);

    if (this.persistenceService.activeWallet) {
      // check that supplied value is not greater than max
      if (value > this.supplySliderMaxValue()) {
        this.inputSupply.classList.add("red-border");
      } else {
        // set slider to this value and reset border color if it passes the check
        this.sliderSupply.noUiSlider.set(value);
        this.inputSupply.classList.remove("red-border");
      }
    }
  }


  /**
   * Logic to trigger when user clicks confirm of asset-user supply
   */
  onAssetSupplyConfirmClick(): void {
    let value = +assetFormat(this.asset.tag).from(this.inputSupply.value);
    log.debug(`Supply of ${this.asset.tag} changed to ${value}`);

    // check that supplied value is not greater than max
    const max = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    if (value > max) {
      value = max;
      this.sliderSupply.noUiSlider.set(value);
      throw new OmmError(`Supplied value greater than available ${this.asset.tag} balance.`);
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
   * Init supply slider
   */
  initSliders(): void {
    // set supply slider values
    const supplied = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);
    const suppliedMax = this.calculationService.calculateAssetSupplySliderMax(this.asset.tag);
    this.slidersService.createNoUiSlider(this.sliderSupply, supplied,
      undefined, undefined, undefined, {min: [0], max: [suppliedMax]});
  }


  /**
   * Handle variable/state changes for subscribed assets
   */
  initSubscribedValues(): void {
    // handle user assets balance changes
    this.subscribeToUserBalanceChange();

    // handle users assets reserve changes
    this.subscribeToUserAssetReserveChange();
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
      const max = supplied + supplyAvailable;
      this.sliderSupply.noUiSlider.updateOptions({
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
      $(this.suppInterestEl).text(assetPrefixPlusFormat(this.asset.tag).to(this.getDailySupplyInterest(supplyDiff)));

      // Update asset-user's supply omm rewards
      $(this.suppRewardsEl).text(ommPrefixPlusFormat.to(-1));
    });

    this.sliderSupply.noUiSlider.on('change', (values: any, handle: any) => {
      const supplyDiff = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) - +values[handle];

      // update risk data
      let riskCalculationData;
      if (supplyDiff > 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, supplyDiff , UserAction.SUPPLY);
      } else if (supplyDiff < 0) {
        riskCalculationData = new RiskCalculationData(this.asset.tag, Math.abs(supplyDiff) , UserAction.REDEEM);
      }
      const riskData = new RiskData(this.calculationService.calculateTotalRiskPercentage(riskCalculationData));
      this.updateRiskData.emit(riskData);
    });
  }

  getDailySupplyInterest(amountBeingSupplied?: number): number {
    return this.calculationService.calculateUsersDailySupplyInterestForAsset(this.asset.tag, amountBeingSupplied);
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

  removeAdjustClass(): void {
    // Remove adjust class
    $(this.supplyEl).removeClass("adjust");
    $(this.borrowEl).removeClass("adjust");
  }

  showDefaultActions(): void {
    // Show default actions
    $(this.supplyAction1El).removeClass("hide");

    $(this.supplyAction2El).addClass("hide");
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

  disableInputs(): void {
    // Disable asset-user inputs (Your markets)
    $(this.inputSupply).attr('disabled', 'disabled');
    $(this.inputSupplyAvailable).attr('disabled', 'disabled');
  }

  hideAsset(): void {
    $(this.assetAvailableEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetAvailableEl).css("display", "table-row");
  }

  supplySliderMaxValue(): number {
    return this.sliderSupply.noUiSlider.options.range.max;
  }

  removeInputRedBorderClass(): void {
    // Remove red border class on input
    this.inputSupply.classList.remove("red-border");
  }

}
