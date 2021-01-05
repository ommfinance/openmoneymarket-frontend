import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {SlidersService} from "../../services/sliders/sliders.service";
import {
  assetFormat, assetPrefixMinusFormat, assetPrefixPlusFormat,
  ommPrefixPlusFormat,
  percentageFormat
} from "../../common/formats";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {Asset, AssetTag} from "../../models/Asset";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {Reserve} from "../../interfaces/reserve";
import {ModalService} from "../../services/modal/modal.service";
import {Modals} from "../../models/Modals";
import {OmmError} from "../../core/errors/OmmError";
import {BaseClass} from "../base-class";
import {AssetAction} from "../../models/AssetAction";
import {NotificationService} from "../../services/notification/notification.service";
import {RiskData} from "../../models/RiskData";

declare var $: any;

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css'],
})
export class AssetComponent extends BaseClass implements OnInit, AfterViewInit {

  @Input() asset!: Asset;
  @Input() index!: number;

  @ViewChild("sliderSupply")set sliderSupplySetter(sliderSupply: ElementRef) {this.sliderSupply = sliderSupply.nativeElement; }
  @ViewChild("sliderBorrow") set sliderBorrowSetter(sliderBorrow: ElementRef) {this.sliderBorrow = sliderBorrow.nativeElement; }
  @ViewChild("supply")set supplyElSetter(supplyEl: ElementRef) {this.supplyEl = supplyEl.nativeElement; }
  @ViewChild("borrow")set borrowElSetter(borrowEl: ElementRef) {this.borrowEl = borrowEl.nativeElement; }
  @ViewChild("assetYour")set assetElSetter(assetEl: ElementRef) { this.assetYourEl = assetEl.nativeElement; }
  @ViewChild("marketExpandedEl")set marketExpandedElSetter(marketExpandedEl: ElementRef) {this.marketExpandedEl = marketExpandedEl.nativeElement; }
  @ViewChild("inputSupply")set inputSupplySetter(inputSupply: ElementRef) { this.inputSupply = inputSupply.nativeElement; }
  @ViewChild("inputBorrow")set inputBorrowSetter(inputBorrow: ElementRef) { this.inputBorrow = inputBorrow.nativeElement; }
  @ViewChild("inpSuppAvail")set inputSupplyAvailableSetter(inputSupplyAvailable: ElementRef) { this.inputSupplyAvailable = inputSupplyAvailable.nativeElement; }
  @ViewChild("inpBorrAvail")set inputBorrowAvailableSetter(inputBorrowAvailable: ElementRef) { this.inputBorrowAvailable = inputBorrowAvailable.nativeElement; }
  @ViewChild("assetAvail")set assetAvailableSetter(assetAvailableEl: ElementRef) { this.assetAvailableEl = assetAvailableEl.nativeElement; }
  @ViewChild("assetAll") set assetAllSetter(assetAllEl: ElementRef) { this.assetAllEl = assetAllEl.nativeElement; }
  @ViewChild("suppAct1") set supplyAction1(suppAct1El: ElementRef) { this.supplyAction1El = suppAct1El.nativeElement; }
  @ViewChild("borrAct1") set borrowAction1(borrAct1El: ElementRef) { this.borrowAction1El = borrAct1El.nativeElement; }
  @ViewChild("suppAct2") set supplyAction2(suppAct2El: ElementRef) { this.supplyAction2El = suppAct2El.nativeElement; }
  @ViewChild("borrAct2") set borrowAction2(borrAct2El: ElementRef) { this.borrowAction2El = borrAct2El.nativeElement; }
  @ViewChild("suppInterest") set suppInterestSetter(suppInterest: ElementRef) { this.suppInterestEl = suppInterest.nativeElement; }
  @ViewChild("borrInterest") set borrInterestSetter(borrInterest: ElementRef) { this.borrInterestEl = borrInterest.nativeElement; }
  @ViewChild("suppRewards") set suppRewardsSetter(suppRewards: ElementRef) { this.suppRewardsEl = suppRewards.nativeElement; }
  @ViewChild("borrRewards") set borrRewardsSetter(borrRewards: ElementRef) { this.borrRewardsEl = borrRewards.nativeElement; }

  suppInterestEl: any;
  suppRewardsEl: any;
  borrInterestEl: any;
  borrRewardsEl: any;

  supplyAction1El: any;
  borrowAction1El: any;
  supplyAction2El: any;
  borrowAction2El: any;

  sliderBorrow: any;
  sliderSupply: any;

  // elements
  supplyEl: any;
  borrowEl: any;
  assetYourEl: any;
  marketExpandedEl: any;
  assetAvailableEl: any;
  assetAllEl: any;

  // inputs
  inputSupply: any;
  inputSupplyAvailable: any;
  inputBorrow: any;
  inputBorrowAvailable: any;

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
    log.info("ngOnInit of asset=", this.asset.tag);
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

    // Reset asset sliders
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
    this.sliderSupply.setAttribute("disabled", "");
    this.sliderBorrow.setAttribute("disabled", "");

    // Reset risk data
    this.updateRiskData.emit();

    // Disable asset inputs
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

    /** Enable Borrow of asset */
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

    /** Enable Supply inputs of asset */
    $(this.inputSupply).removeAttr("disabled");
    $(this.inputSupplyAvailable).removeAttr("disabled");
    $(this.sliderSupply).removeAttr("disabled");
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
  }


  /**
   * Asset expand logic
   */
  onAssetClick(): void {

    /** Layout */

    if (this.index === 0) {
      // Expand asset table
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

    // Disable and reset asset supply and borrow sliders (Your markets)
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
    const amount = +assetFormat(this.asset.tag).from(this.inputSupply.value);
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
    if (this.persistenceService.activeWallet) {
      if (amount > +assetFormat(this.asset.tag).from(this.inputBorrowAvailable.value)) {
        this.inputBorrow.style.borderColor = "red";
      } else {
        this.inputBorrow.style.borderColor = "#c7ccd5";
      }
    }
  }


  /**
   * Logic to trigger when user clicks confirm of asset supply
   */
  onAssetSupplyConfirmClick(): void {
    let value = +assetFormat(this.asset.tag).from(this.inputSupply.value);
    log.debug(`Supply of ${this.asset.tag} changed to ${value}`);

    // check that supplied value is not greater than user asset balance
    if (value > this.persistenceService.activeWallet!.balances.get(this.asset.tag)!
      + this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag)) {
      value = Math.floor(this.persistenceService.activeWallet?.balances.get(this.asset.tag)! +
        this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
      this.sliderSupply.noUiSlider.set(value);
      throw new OmmError(`Supplied value greater than ${this.asset.tag} balance.`);
    }
    const supplyAmountDiff = value - Math.floor(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));

    const before = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag);
    const amount = Math.floor(Math.abs(supplyAmountDiff));
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
   * Logic to trigger when user clicks confirm of asset borrow
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
    this.slidersService.createNoUiSlider(this.sliderSupply);
    this.slidersService.createNoUiSlider(this.sliderBorrow, 1500, undefined, undefined, undefined,
      {min: [0], max: [3300]});
  }

  /**
   * Handle variable/state changes for subscribed assets
   */
  initSubscribedValues(): void {
    // handle asset balance change
    this.stateChangeService.userBalanceChangeMap.get(this.asset.tag)!.subscribe(newBalance => {
      log.debug(`${this.asset.tag} balance changed to ${newBalance}`);
      if (this.sliderSupply) {
        this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(newBalance);
        this.sliderSupply.noUiSlider.updateOptions({
          range: {
            min: 0,
            max: newBalance + (this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) ?? 0)
          }
        });
      }
    });

    // handle users asset reserve change
    this.stateChangeService.userReserveChangeMap.get(this.asset.tag)!.subscribe((reserve: Reserve) => {
      log.debug(`${this.asset.tag} reserve changed to: `, reserve);

      // update input supply value to new asset reserve balance
      this.inputSupply.value = assetFormat(this.asset.tag).to(reserve.currentOTokenBalance);

      // update supply slider value
      this.sliderSupply.noUiSlider.set(reserve.currentOTokenBalance);

      // update supply slider max value to  -> user asset balance + supplied
      this.sliderSupply.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: (this.persistenceService.activeWallet?.balances.get(this.asset.tag) ?? 0) +
            (this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) ?? 0)
        }
      });
      // set borrow supplied and slider value
      this.inputBorrow.value = assetFormat(this.asset.tag).to(reserve.principalBorrowBalance);
      this.inputBorrowAvailable.value = this.calculationService.calculateAssetSliderAvailableBorrow(
        assetFormat(this.asset.tag).from(this.inputBorrowAvailable.value), this.asset.tag);
      this.sliderBorrow.noUiSlider.set(reserve.principalBorrowBalance);
      // update USDb borrow slider max value to  -> user USDb balance + supplied USDb
      this.sliderBorrow.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: this.calculationService.calculateAssetBorrowSliderMax(this.asset.tag)
        }
      });
    });
  }

  /**
   * Supply slider logic
   */
  initSupplySliderlogic(): void {
    // On asset supply slider update (Your markets)
    this.sliderSupply.noUiSlider.on('update', (values: any, handle: any) => {

      // Update supplied text box
      this.inputSupply.value = (parseFloat(values[handle]));
      const supplyDiff = this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag) - this.inputSupply.value;

      // Update asset available text box
      this.inputSupplyAvailable.value = assetFormat(this.asset.tag).to(this.calculationService.calculateAssetSliderAvailableSupply(+values[handle], this.asset.tag));

      // Update asset's supply interest
      $(this.suppInterestEl).text(assetPrefixPlusFormat(this.asset.tag).to((parseFloat(values[handle])) * 0.0647 / 365));

      // Update asset's supply omm rewards
      $(this.suppRewardsEl).text(ommPrefixPlusFormat.to((parseFloat(values[handle])) * 0.447 / 365));

      // update risk data
      const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, supplyDiff, undefined));
      this.updateRiskData.emit(riskData);
    });
  }

  /**
   * Borrow slider logic
   */
  initBorrowSliderLogic(): void {
    // On asset borrow slider update (Your markets)
    this.sliderBorrow.noUiSlider.on('update', (values: any, handle: any) => {
      // Update asset borrowed text box
      this.inputBorrow.value = (parseFloat(values[handle]));
      const borrowDiff = this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag) - this.inputBorrow.value;

      // Update asset available text box
      this.inputBorrowAvailable.value = assetFormat(this.asset.tag).to(this.calculationService.calculateAssetSliderAvailableBorrow(values[handle], this.asset.tag));

      // Update asset's borrow interest
      $(this.borrInterestEl).text(assetPrefixMinusFormat(this.asset.tag).to((values[handle] * 1) * 0.0725 / 365));

      // Update asset's borrow omm rewards
      $(this.borrRewardsEl).text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

      // update risk data
      const riskData = new RiskData(this.calculationService.calculateValueRiskTotal(this.asset.tag, undefined, borrowDiff));
      this.updateRiskData.emit(riskData);

      // TODO
      // if (inputBorrowUsdb.value > 0) {
      //   // show risk data
      //   $('.risk-container').css("display", "block");
      //
      //   // Hide risk message
      //   $('.risk-message-noassets').css("display", "none");
      // }
    });
  }

  collapseAssetTableSlideUp(): void {
    // Collapse asset table`
    $(`.asset.${this.asset.tag}`).removeClass('active');
    $(this.marketExpandedEl).slideUp();
  }

  collapseAssetTable(): void {
    // Collapse asset table`
    $(`.asset.${this.asset.tag}`).removeClass('active');
    $(this.marketExpandedEl).hide();
  }

  hideAvailableAssetData(): void {
    // Hide available assets data
    $(this.assetAvailableEl).css("display", "none");
    $(this.assetYourEl).css("display", "none");
  }

  showAllMarketTableData(): void {
    // Show "All market" table data
    $(this.assetAllEl).css("display", "table-row");
  }

  hideAllMarketTableData(): void {
    // Hide "All market" table data
    $(this.assetAllEl).css("display", "none");
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
    $(this.borrowAction1El).removeClass("hide");
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
    // Disable asset supply sliders (Your markets)
    this.sliderSupply.noUiSlider.set(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
    this.sliderSupply.setAttribute("disabled", "");
  }

  disableAndResetBorrowSlider(): void {
    // Disable asset borrow sliders (Your markets)
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
    this.sliderBorrow.setAttribute("disabled", "");
  }

  disableInputs(): void {
    // Disable asset inputs (Your markets)
    $(this.inputSupply).attr('disabled', 'disabled');
    $(this.inputSupplyAvailable).attr('disabled', 'disabled');
    $(this.inputBorrow).attr('disabled', 'disabled');
    $(this.inputBorrowAvailable).attr('disabled', 'disabled');
  }

  enableAssetBorrow(): void {
    $(this.inputBorrow).removeAttr("disabled");
    $(this.inputBorrowAvailable).removeAttr("disabled");
    $(this.sliderBorrow).removeAttr("disabled");
    this.sliderBorrow.noUiSlider.set(this.persistenceService.getUserBorrowedAssetBalance(this.asset.tag));
  }

  hideYourAsset(): void {
    $(this.assetYourEl).css("display", "none");
  }

  hideAllMarketAsset(): void {
    $(this.assetAllEl).css("display", "none");
  }

  showYourAsset(): void {
    $(this.assetYourEl).css("display", "table-row");
  }

  showAllMarketAsset(): void {
    $(this.assetAllEl).css("display", "table-row");
  }

}
