import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import {UserReserveData} from "../../models/UserReserveData";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Asset, AssetClass, AssetName, AssetTag} from "../../models/Asset";
import {BaseClass} from "../base-class";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {AssetAction} from "../../models/AssetAction";

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

  onClaimOmmRewardsClick(): void {
    const before = this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0;
    const rewards = this.persistenceService.userOmmRewards?.total ?? 0;
    const after = this.roundOffTo2Decimals(before + rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDb, AssetName.USDb, AssetTag.USDb),
      before, after, rewards));
  }

  shouldHideClaimBtn(): boolean {
    return (this.persistenceService.userOmmRewards?.total ?? 0) <= 0
      || this.persistenceService.userOmmRewards == null
      || this.persistenceService.userOmmTokenBalanceDetails == null;
  }

}
