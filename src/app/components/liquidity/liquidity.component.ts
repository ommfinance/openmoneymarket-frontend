import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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

declare var $: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  styleUrls: ['./liquidity.component.css']
})
export class LiquidityComponent extends BaseClass implements OnInit {

  toggleYourPoolsEl: any;
  @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any;
  @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }
  poolExpandedEl: any;
  @ViewChild("poolExpandedEl") set c(c: ElementRef) {this.poolExpandedEl = c.nativeElement; }
  yourPoolEl: any;
  @ViewChild("yourPool") set d(d: ElementRef) {this.yourPoolEl = d.nativeElement; }

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

  getAllPoolsData(): PoolData[] {
    return this.persistenceService.allPools;
  }

  getTotalSuppliedBase(poolData: PoolData): number {
    return this.calculationService.calculateTotalSupplied(poolData);
  }

  getTotalSuppliedQuote(poolData: PoolData): number {
    return this.calculationService.calculateTotalSupplied(poolData, false);
  }

  getDailyRewards(poolData: PoolData): number {
    return this.calculationService.calculateDailyRewardsForPool(poolData);
  }

  getDailyRewardsAllPools(): number {
    return this.calculationService.calculateDailyRewardsAllPools();
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

  getAverageApy(): number {
    return this.calculationService.getAllPoolAverageApy();
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

  onPoolClick(pairClassName: string): void {
    log.debug("onPoolClick: " + pairClassName);
    $(`.pool.${pairClassName}`).toggleClass('active');
    $(`.pool-${pairClassName}-expanded`).slideToggle();
  }
}
