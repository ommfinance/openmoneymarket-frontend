import {
  Component,
  Input,
  OnInit,
  ChangeDetectorRef,
  ViewChild, AfterViewInit, ElementRef
} from '@angular/core';
import {SlidersService} from "../../services/sliders/sliders.service";
import {ommPrefixPlusFormat, usdbFormat, usdbPrefixMinusFormat, usdbPrefixPlusFormat} from "../../common/formats";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {Asset} from "../../models/Asset";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {Reserve} from "../../interfaces/reserve";
import {ModalService} from "../../services/modal/modal.service";
import {Modals} from "../../models/Modals";
import {OmmError} from "../../core/errors/OmmError";

declare var $: any;

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css'],
})
export class AssetComponent implements OnInit, AfterViewInit {
  @Input()
  asset!: Asset;

  // sliders
  @ViewChild("sliderSupply")
  set sliderSupplySetter(sliderSupply: ElementRef) {this.sliderSupply = sliderSupply.nativeElement; }

  @ViewChild("sliderBorrow")
  set sliderBorrowSetter(sliderBorrow: ElementRef) {this.sliderBorrow = sliderBorrow.nativeElement; }

  @ViewChild("supply")
  set supplyElSetter(supplyEl: ElementRef) {this.supplyEl = supplyEl.nativeElement; }

  @ViewChild("borrow")
  set borrowElSetter(borrowEl: ElementRef) {this.borrowEl = borrowEl.nativeElement; }

  @ViewChild("assetYour")
  set assetElSetter(assetEl: ElementRef) { this.assetEl = assetEl.nativeElement; }

  @ViewChild("marketExpandedEl")
  set marketExpandedElSetter(marketExpandedEl: ElementRef) {this.marketExpandedEl = marketExpandedEl.nativeElement; }

  @ViewChild("inputSupply")
  set inputSupplySetter(inputSupply: ElementRef) { this.inputSupply = inputSupply.nativeElement; }

  @ViewChild("inputBorrow")
  set inputBorrowSetter(inputBorrow: ElementRef) { this.inputBorrow = inputBorrow.nativeElement; }

  @ViewChild("inpSuppAvail")
  set inputSupplyAvailableSetter(inputSupplyAvailable: ElementRef) { this.inputSupplyAvailable = inputSupplyAvailable.nativeElement; }

  @ViewChild("inpBorrAvail")
  set inputBorrowAvailableSetter(inputBorrowAvailable: ElementRef) { this.inputBorrowAvailable = inputBorrowAvailable.nativeElement; }

  sliderBorrow: any;
  sliderSupply: any;

  // elements
  supplyEl: any;
  borrowEl: any;
  assetEl: any;
  marketExpandedEl: any;


  // inputs
  inputSupply: any;
  inputSupplyAvailable: any;
  inputBorrow: any;
  inputBorrowAvailable: any;

  // @Output() inputSupplyChanged = new EventEmitter<{ value: number, assetTag: AssetTag }>();
  // @Output() inputBorrowChanged = new EventEmitter<{ value: number, assetTag: AssetTag }>();


  constructor(private slidersService: SlidersService,
              private calculationService: CalculationsService,
              private stateChangeService: StateChangeService,
              private persistenceService: PersistenceService,
              private modalService: ModalService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    log.info("ngOnInit of asset=", this.asset.tag);
  }

  ngAfterViewInit(): void {
    this.initSliders();
    this.initSupplySliderlogic();
    this.initSubscribedValues();
  }


  /**
   * Asset expand logic
   */
  onAssetClick(): void {
  // On Asset click
    // Layout

    // Expand asset table
    $(this.assetEl).toggleClass('active');
    $(this.marketExpandedEl).slideToggle();

    // Collapse ICX table TODO
    // $(".asset.icx").removeClass('active');
    // $(".market-icx-expanded").slideUp();

    //
    // Set everything to default
    //

    // Remove adjust class
    $(this.supplyEl).removeClass("adjust");
    $(this.borrowEl).removeClass("adjust");

    // Show default actions
    // $('.actions-1').removeClass("hide");
    // $('.actions-2').addClass("hide");

    // Disable USDb supply sliders (Your markets) TODO
    // this.sliderSupply.noUiSlider.set(Cookies.get('supplied-usdb'));
    // this.sliderSupply.setAttribute("disabled", "");

    // Disable USDb borrow sliders (Your markets)
    // this.sliderBorrow.noUiSlider.set(Cookies.get('borrowed-usdb'));
    // this.sliderBorrow.setAttribute("disabled", "");

    // Disable ICX supply sliders
    // sliderSupplyIcx.noUiSlider.set(Cookies.get('supplied-icx'));
    // sliderSupplyIcx.setAttribute("disabled", "");

    // Disable ICX borrow sliders  (Your markets)
    // sliderBorrowIcx.noUiSlider.set(Cookies.get('borrowed-icx'));
    // sliderBorrowIcx.setAttribute("disabled", "");

    // Disable USDb inputs
    $('#input-supply').attr('disabled', 'disabled');
    $('#input-supply-available').attr('disabled', 'disabled');
    $('#input-borrow').attr('disabled', 'disabled');
    $('#input-borrow-available').attr('disabled', 'disabled');

    // Disable ICX inputs
    // $('#input-supply-icx').attr('disabled', 'disabled');
    // $('#input-supply-available-icx').attr('disabled', 'disabled');
    // $('#input-borrow-icx').attr('disabled', 'disabled');
    // $('#input-borrow-available-icx').attr('disabled', 'disabled');

    // If USDb and ICX borrow = 0
    // if (parseFloat(Cookies.get('borrowed-usdb')) == 0 && parseFloat(Cookies.get('borrowed-icx')) == 0) {
    //   // show risk data
    //   $('.risk-container').css("display", "none");
    //   // Hide risk message
    //   $('.risk-message-noassets').css("display", "block");
    // };
    //
    // // If USDb or ICX borrow is greater than 0
    // if (parseFloat(Cookies.get('borrowed-usdb')) > 0 || parseFloat(Cookies.get('borrowed-icx')) > 0) {
    //   // show risk data
    //   $('.risk-container').css("display", "block");
    //   // Hide risk message
    //   $('.risk-message-noassets').css("display", "none");
    // };
  }

  /**
   * Logic to trigger on supply amount change
   */
  supplyAssetAmountChange(): void {
    const amount = +usdbFormat.from(this.inputSupply.value);
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
    const amount = +usdbFormat.from(this.inputBorrow.value);
    if (this.persistenceService.activeWallet) {
      if (amount > +usdbFormat.from(this.inputBorrowAvailable.value)) {
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
    let amount = +usdbFormat.from(this.inputSupply.value);
    log.debug(`Supply of ${this.asset.tag} changed to ${amount}`);

    // check that supplied value is not greater than user asset balance
    if (amount > this.persistenceService.activeWallet!.balances.get(this.asset.tag)!
      + this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag)) {
      amount = Math.floor(this.persistenceService.activeWallet?.balances.get(this.asset.tag)! +
        this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
      this.sliderSupply.noUiSlider.set(amount);
      throw new OmmError(`Supplied value greater than ${this.asset.tag} balance.`);
    }
    const supplyAmountDiff = amount - Math.floor(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));

    if (supplyAmountDiff > 0) {
      this.modalService.showNewModal(Modals.SUPPLY);
    } else if (supplyAmountDiff < 0) {
      this.modalService.showNewModal(Modals.WITHDRAW);
    } else {
      alert("No change in supplied value!");
      return;
    }
  }

  /**
   * Logic to trigger when user clicks confirm of asset borrow
   */
  onAssetBorrowConfirmClick(): void {
    const amount = +usdbFormat.from(this.inputBorrow.value);
    const borrowAmountDiff = amount - Math.floor(this.persistenceService.getUserSuppliedAssetBalance(this.asset.tag));
  // TODO add check
    if (borrowAmountDiff > 0) {
      this.modalService.showNewModal(Modals.BORROW);
    } else if (borrowAmountDiff < 0) {
      this.modalService.showNewModal(Modals.REPAY);
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
        this.inputSupplyAvailable.value = usdbFormat.to(newBalance);
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
      this.inputSupply.value = usdbFormat.to(reserve.currentOTokenBalance);

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
      this.inputBorrow.value = usdbFormat.to(reserve.principalBorrowBalance);
      this.inputBorrowAvailable.value = this.calculationService.calculateAssetSliderAvailableBorrow(
        usdbFormat.from(this.inputBorrowAvailable.value), this.asset.tag);
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

      // Update asset available text box
      this.inputSupplyAvailable.value = usdbFormat.to(this.calculationService.calculateAssetSliderAvailableSupply(+values[handle], this.asset.tag));

      // Update asset's supply interest
      $('.value-supply-interest').text(usdbPrefixPlusFormat.to((parseFloat(values[handle])) * 0.0647 / 365));

      // Update asset's supply omm rewards
      $('.value-supply-rewards').text(ommPrefixPlusFormat.to((parseFloat(values[handle])) * 0.447 / 365));

      // Update the risk percentage TODO
      // $('.value-risk-total').text(percentageFormat.to((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

      // Update the risk slider v2 TODO
      // sliderRisk.noUiSlider.set((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100);

      // Change text to red if over 100 TODO
      // if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 100) {
      //   // Hide supply actions
      //   $('.supply-actions.actions-2').css("display", "none");
      //   // Show supply warning
      //   $('.supply-actions.actions-2').css("display", "none");
      // };

      // Change text to red if over 75 TODO
      // if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 75) {
      //   $('.value-risk-total').addClass("alert");
      // }
      // // Change text to normal if under 75
      // if (((parseFloat(Cookies.get('borrowed-usdb')) + parseFloat(Cookies.get('borrowed-icx'))) / ((inputSupplyUsdb.value * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) < 75) {
      //   $('.value-risk-total').removeClass("alert");
      // }
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

      // Update asset available text box
      this.inputBorrowAvailable.value = usdbFormat.to(this.calculationService.calculateAssetSliderAvailableBorrow(values[handle], this.asset.tag));

      // Update asset's borrow interest
      $('.value-borrow-interest-usdb').text(usdbPrefixMinusFormat.to((values[handle] * 1) * 0.0725 / 365));

      // Update asset's borrow omm rewards
      $('.value-borrow-rewards-usdb').text(ommPrefixPlusFormat.to((values[handle] * 1) * 0.4725 / 365));

      // Update the risk percentage TODO
      // $('.value-risk-total').text(percentageFormat.to(((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

      // Update the risk slider v2 TODO
      // sliderRisk.noUiSlider.set((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100));

      // Change text to red if over 75 TODO
      // if ((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) > 75) {
      //   $('.value-risk-total').addClass("alert");
      // }
      // // Change text to normal if under 75
      // if ((((parseFloat(values[handle])) + parseFloat(Cookies.get('borrowed-icx'))) / ((parseFloat(Cookies.get('supplied-usdb')) * 0.66) + (parseFloat(Cookies.get('supplied-icx')) * 0.66)) * 100) < 75) {
      //   $('.value-risk-total').removeClass("alert");
      // }
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



}
