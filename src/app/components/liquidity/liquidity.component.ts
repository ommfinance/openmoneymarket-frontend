import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ActiveLiquidityOverview, ActiveLiquidityPoolsView} from "../../models/ActiveViews";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Utils} from "../../common/utils";
import {ModalType} from "../../models/ModalType";
import {AssetAction, ClaimOmmDetails} from "../../models/AssetAction";
import {Asset, AssetClass, AssetName, AssetTag} from "../../models/Asset";
import {ModalService} from "../../services/modal/modal.service";
import {PoolData} from "../../models/PoolData";
import {CalculationsService} from "../../services/calculations/calculations.service";
import log from "loglevel";
import {UserPoolData} from "../../models/UserPoolData";
import {ModalAction} from "../../models/ModalAction";

declare var $: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  styleUrls: ['./liquidity.component.css']
})
export class LiquidityComponent extends BaseClass implements OnInit, AfterViewInit {

  toggleYourPoolsEl: any;
  @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any;
  @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }

  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  constructor(public persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private modalService: ModalService,
              private calculationService: CalculationsService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {

  }

  onClaimOmmRewardsClick(): void {
    const rewards = this.roundDownTo2Decimals(this.persistenceService.userOmmRewards?.total ?? 0);

    if (rewards <= 0) {
      return;
    }

    const before = this.roundDownTo2Decimals(this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0);
    const after = Utils.addDecimalsPrecision(before, rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS),
      before, after, rewards, undefined, new ClaimOmmDetails(this.persistenceService.userOmmRewards)));
  }

  getUserOmmRewardsBalance(): number {
    return this.persistenceService.userOmmRewards?.total ?? 0;
  }

  private registerSubscriptions(): void {
    this.subscribeToLoginChange();
    this.subscribeToUserModalActionChange();
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.collapseTables();
    });
  }

  private subscribeToLoginChange(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) {
        // user login
        this.onYourLiquidityClick();
        this.onYourPoolsClick();
      } else {
        // user logout
        this.onAllLiquidityClick();
        this.onAllPoolsClick();
      }
    });
  }

  userHasStakedToPool(poolData: UserPoolData): boolean {
    return poolData.userStakedBalance > 0;
  }

  getAllPoolsData(): PoolData[] {
    return this.persistenceService.allPools;
  }

  getUserPoolsData(): UserPoolData[] {
    return this.persistenceService.userPools;
  }

  userHasStakedToAnyPool(): boolean {
    for (const poolData of this.getUserPoolsData()) {
      if (poolData.userStakedBalance > 0) {
        return true;
      }
    }

    return false;
  }

  userHasLpTokenAvailableOrHasStaked(poolId: number): boolean {
    return this.persistenceService.getUserPoolStakedAvailableBalance(poolId) > 0
      || this.persistenceService.getUserPoolStakedBalance(poolId) > 0;
  }

  getTotalSuppliedBase(poolData: PoolData): number {
    return this.calculationService.calculatePoolTotalSupplied(poolData);
  }

  getUserSuppliedBase(poolData: UserPoolData): number {
    return this.calculationService.calculateUserPoolSupplied(poolData);
  }

  getTotalSuppliedQuote(poolData: PoolData): number {
    return this.calculationService.calculatePoolTotalSupplied(poolData, false);
  }

  getUserSuppliedQuote(poolData: UserPoolData): number {
    return this.calculationService.calculateUserPoolSupplied(poolData, false);
  }

  getDailyRewards(poolData: PoolData): number {
    return this.calculationService.calculateDailyRewardsForPool(poolData);
  }

  getUserDailyRewards(poolData: UserPoolData): number {
    return this.calculationService.calculateUserDailyRewardsForPool(poolData);
  }

  getUserDailyRewardsUSD(poolData: UserPoolData): number {
    return this.calculationService.calculateUserDailyRewardsForPool(poolData) * this.persistenceService.ommPriceUSD;
  }

  getDailyRewardsAllPools(): number {
    return this.calculationService.calculateDailyRewardsAllPools();
  }

  getDailyRewardsUserPools(): number {
    return this.calculationService.calculateDailyRewardsUserPools();
  }

  getDailyRewardsUSD(poolData: PoolData): number {
    return this.calculationService.calculateDailyRewardsForPool(poolData) * this.persistenceService.ommPriceUSD;
  }

  getLiquidityApy(poolData: PoolData): number {
    return this.calculationService.calculatePoolLiquidityApy(poolData);
  }

  getTotalLiquidityUSD(): number {
    return this.calculationService.getAllPoolTotalLiquidityUSD();
  }

  getUserLiquidityUSD(): number {
    return this.calculationService.getUserTotalLiquidityUSD();
  }

  getAverageApy(): number {
    return this.calculationService.getAllPoolsAverageApy();
  }

  getUserAverageApy(): number {
    return this.calculationService.getUserPoolsAverageApy();
  }

  isAllPoolsActive(): boolean {
    return this.activeLiquidityPoolView === ActiveLiquidityPoolsView.ALL_POOLS;
  }

  isAllLiquidityOverviewActive(): boolean {
    return this.activeLiquidityOverview === ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  onYourLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.YOUR_LIQUIDITY;
  }

  onAllLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  onYourPoolsClick(): void {
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.YOUR_POOLS;
  }

  onAllPoolsClick(): void {
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.ALL_POOLS;
  }

  collapseTables(): void {
    this.getAllPoolsData().forEach(poolData => {
      $(`.pool.${poolData.getPairClassName()}`).removeClass('active');
      $(`.pool-${poolData.getPairClassName()}-expanded`).slideUp();
    });
  }

  onPoolClick(poolData: UserPoolData | PoolData): void {
    // commit event to state change
    this.stateChangeService.poolClickCUpdate(poolData);

    $(`.pool.${poolData.getPairClassName()}`).toggleClass('active');
    $(`.pool-${poolData.getPairClassName()}-expanded`).slideToggle();
  }

}
