import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Modals} from "../../models/Modals";
import {ModalService} from "../../services/modal/modal.service";
import {UserReserveData} from "../../models/UserReserveData";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {AssetTag} from "../../models/Asset";
import {BaseClass} from "../base-class";
import {CalculationsService} from "../../services/calculations/calculations.service";

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent extends BaseClass implements OnInit {

  @ViewChild('suppInterest', { static: true }) supplyInterestEl!: ElementRef;
  @ViewChild('borrInterest', { static: true }) borrowInterestEl!: ElementRef;

  supplyInterest = 0;
  borrowInterest = 0;
  ommRewards = 0;

  constructor(private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private calculationService: CalculationsService) {
    super();
  }

  ngOnInit(): void {
    // handle users assets reserve changes
    this.subscribeToUserAssetReserveChange();
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
  }

  updateSupplyInterest(): void {
    this.supplyInterest = this.calculationService.calculateUsersSupplyInterestPerDayUSD();
  }

  updateBorrowInterest(): void {
    this.borrowInterest = this.calculationService.calculateUsersBorrowInterestPerDayUSD();
  }

  onClaimOmmRewardsClick(): void {
    this.modalService.showNewModal(Modals.CLAIM_OMM_REWARDS);
  }

}
