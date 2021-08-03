import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import {UserReserveData} from "../../models/UserReserveData";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Asset, AssetClass, AssetName, AssetTag} from "../../models/Asset";
import {BaseClass} from "../base-class";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {AssetAction, ClaimOmmDetails} from "../../models/AssetAction";
import {PerformanceDropDownOption} from "../../models/PerformanceDropDownOption";
import {Utils} from "../../common/utils";

declare var $: any;

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent extends BaseClass implements OnInit, AfterViewInit {

  @ViewChild('suppInterest', { static: true }) supplyInterestEl!: ElementRef;
  @ViewChild('borrInterest', { static: true }) borrowInterestEl!: ElementRef;

  supplyInterest = 0;
  borrowInterest = 0;
  ommRewards = 0;

  dropDownOptions = [...Object.values(PerformanceDropDownOption)];
  selectedDropDownOption = this.dropDownOptions[0].toLowerCase();

  constructor(private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private calculationService: CalculationsService,
              public persistenceService: PersistenceService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    // handle users assets reserve changes
    this.subscribeToUserAssetReserveChange();
  }

  ngAfterViewInit(): void {
    if (this.userLoggedIn()) {
      this.updatePerformanceValues();
    }
  }

  public subscribeToUserAssetReserveChange(): void {
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userReserveChangeMap.get(assetTag)!.subscribe((reserve: UserReserveData) => {
        // update performance values
        this.updatePerformanceValues();
      });
    });
  }

  updatePerformanceValues(): void {
    this.updateSupplyInterest();
    this.updateBorrowInterest();
    this.updateOmmRewards();
  }

  updateSupplyInterest(): void {
    this.supplyInterest = this.calculationService.calculateUsersSupplyInterestPerDayUSD();
  }

  updateBorrowInterest(): void {
    this.borrowInterest = this.calculationService.calculateUsersBorrowInterestPerDayUSD();
  }

  updateOmmRewards(): void {
    this.ommRewards = this.calculationService.calculateUserTotalOmmRewards();
  }

  onTimeSelectorClick(): void {
    $("#time-selector").toggleClass("active");
    $(".time-selector-content").toggleClass("active");
  }

  onDropDownOptionClick(option: string): void {
    this.selectedDropDownOption = option.toLowerCase();
    this.dropDownOptions = [...this.dropDownOptions];
  }

  getDropDownOptionMultiplier(): number {
    switch (this.selectedDropDownOption) {
      case PerformanceDropDownOption.DAY.toLowerCase():
        return 1;
      case PerformanceDropDownOption.WEEK.toLowerCase():
        return 7;
      case PerformanceDropDownOption.MONTH.toLowerCase():
        return Utils.getNumberOfDaysInCurrentMonth();
      case PerformanceDropDownOption.YEAR.toLowerCase():
        return 365;
      default:
        return 1;
    }
  }
}
