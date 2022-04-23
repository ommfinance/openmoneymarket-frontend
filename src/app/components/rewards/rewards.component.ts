import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ActiveLiquidityOverview, ActiveLiquidityPoolsView} from "../../models/enums/ActiveViews";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Utils} from "../../common/utils";
import {ModalType} from "../../models/enums/ModalType";
import {AssetAction, ClaimOmmDetails} from "../../models/classes/AssetAction";
import {Asset, AssetClass, AssetName, AssetTag, supportedAssetsMap} from "../../models/classes/Asset";
import {ModalService} from "../../services/modal/modal.service";
import {PoolData} from "../../models/classes/PoolData";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {UserPoolData} from "../../models/classes/UserPoolData";
import {ModalAction} from "../../models/classes/ModalAction";
import {OmmTokenBalanceDetails} from "../../models/classes/OmmTokenBalanceDetails";
import {environment} from "../../../environments/environment";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {lockedDateTobOmmPerOmm, Times} from "../../common/constants";
import BigNumber from "bignumber.js";
import {LockDate} from "../../models/enums/LockDate";
import {OmmLockingComponent} from "../omm-locking/omm-locking.component";
import {IMarketBoosterData} from "../../models/Interfaces/IMarketBoosterData";
import {ILiquidityBoosterData} from "../../models/Interfaces/ILiquidityBoosterData";

declare var $: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent extends BaseClass implements OnInit, OnDestroy {

  TAG = "[RewardsComponent]";

  toggleYourPoolsEl: any; @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any; @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }
  lockDailyRewardsEl: any; @ViewChild("lockDailyRew") set e(e: ElementRef) {this.lockDailyRewardsEl = e?.nativeElement; }
  lockAprEl: any; @ViewChild("lockApr") set f(f: ElementRef) {this.lockAprEl = f?.nativeElement; }
  marketBoosterFromEl?: any; @ViewChild("mrktBoosterFrom") set g(g: ElementRef) {this.marketBoosterFromEl = g?.nativeElement; }
  marketBoosterToEl?: any; @ViewChild("mrktBoosterTo") set h(h: ElementRef) {this.marketBoosterToEl = h?.nativeElement; }
  liquidityBoosterFromEl?: any; @ViewChild("liqBoosterFrom") set i(i: ElementRef) {this.liquidityBoosterFromEl = i?.nativeElement; }
  liquidityBoosterToEl?: any; @ViewChild("liqBoosterTo") set j(j: ElementRef) {this.liquidityBoosterToEl = j?.nativeElement; }

  @ViewChild(OmmLockingComponent) ommLockingComponent!: OmmLockingComponent;

  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  lockAdjustActive = false; // flag that indicates whether the locked adjust is active (confirm and cancel shown)

  marketBoosterData?: IMarketBoosterData;
  liquidityBoosterData?: ILiquidityBoosterData;


  constructor(public persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private modalService: ModalService,
              private calculationService: CalculationsService,
              public reloaderService: ReloaderService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initValues();

    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
  }

  initValues(): void {
    this.marketBoosterData = this.calculationService.calculateUserbOmmMarketBoosters();
    this.liquidityBoosterData = this.calculationService.calculateUserbOmmLiquidityBoosters();
  }


  /**
   * Click event handlers
   */

  onClaimOmmRewardsClick(): void {
    this.ommLockingComponent.onLockAdjustCancelClick();
    this.lockAdjustActive = false;

    const rewards = (this.persistenceService.userAccumulatedOmmRewards?.total ?? new BigNumber("0")).dp(2);

    if (rewards.isLessThanOrEqualTo(Utils.ZERO)) {
      return;
    }

    const before = (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).dp(2);
    const after = Utils.add(before, rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS),
      before, after, rewards, undefined, new ClaimOmmDetails(this.persistenceService.userAccumulatedOmmRewards)));
  }

  // On "Lock up OMM" or "Adjust" click
  onLockAdjustClick(): void {
    this.collapseAllPoolTables();
  }

  onYourLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.YOUR_LIQUIDITY;
  }

  onAllLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  onYourPoolsClick(): void {
    this.ommLockingComponent.onLockAdjustCancelClick();
    this.collapseAllPoolTables();
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.YOUR_POOLS;
  }

  onAllPoolsClick(): void {
    this.ommLockingComponent.onLockAdjustCancelClick();
    this.collapseAllPoolTables();
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.ALL_POOLS;
  }

  collapseAllPoolTables(): void {
    // collapse all pools tables
    this.getAllPoolsData().forEach(poolData => {
      $(`.pool.${poolData.getPairClassName()}`).removeClass('active');
      $(`.pool-${poolData.getPairClassName()}-expanded`).slideUp();
    });
  }

  collapsePoolTablesSlideUp(poolData: UserPoolData | PoolData): void {
    // Collapse pools other than the one clicked up
    this.getAllPoolsData().forEach(pool => {
      if (!pool.poolId.isEqualTo(poolData.poolId)) {
        $(`.pool.${pool.getPairClassName()}`).removeClass('active');
        $(`.pool-${pool.getPairClassName()}-expanded`).slideUp();
      }
    });
  }

  onPoolClick(poolData: UserPoolData | PoolData): void {
    // collapse other pools expanded up
    this.collapsePoolTablesSlideUp(poolData);

    this.lockAdjustActive = false;
    this.ommLockingComponent.onLockAdjustCancelClick();

    // commit event to state change
    this.stateChangeService.poolClickCUpdate(poolData);

    $(`.pool.${poolData.getPairClassName()}`).toggleClass('active');
    $(`.pool-${poolData.getPairClassName()}-expanded`).slideToggle();
  }

  /**
   * Subscriptions
   */

  private registerSubscriptions(): void {
    this.subscribeToLoginChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToAfterUserDataReload();
  }

  public subscribeToAfterUserDataReload(): void {
    this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.initValues();
      this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.ommLockingComponent.onLockAdjustCancelClick();
      this.collapseAllPoolTables();
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

  /**
   * Getters, setters and checks
   */

  handleLockSliderValueUpdate(value: number): void {
    const bigNumValue = new BigNumber(value);

    if (this.userLoggedIn() && !this.userLockedOmmBalance().eq(bigNumValue.dp(0))) {
      // Update dynamic User daily Omm rewards
      if (this.lockDailyRewardsEl) {
        this.updateUserDailyRewards(bigNumValue, this.ommLockingComponent.currentLockPeriodDate());
      }

      // Update dynamic User lock APR
      if (this.lockAprEl) {
        this.updateUserLockApr(bigNumValue);
      }

      this.updateLiquidityAndMarketBoosters(bigNumValue);
    }
  }

  shouldHideClaimBtn(): boolean {
    const userOmmRewardsTotal = this.persistenceService.userAccumulatedOmmRewards?.total ?? new BigNumber("0");
    return userOmmRewardsTotal.isLessThanOrEqualTo(Utils.ZERO) || !this.persistenceService.userOmmTokenBalanceDetails;
  }

  rewardsAccrueStartDateHasPassed(): boolean {
    return environment.REWARDS_ACCRUE_START < this.reloaderService.currentTimestamp;
  }

  rewardsClaimStartDateHasPassed(): boolean {
    return environment.REWARDS_CLAIMABLE_START < this.reloaderService.currentTimestamp;
  }

  rewardsTimeStampsActivated(): boolean {
    return environment.ACTIVATE_REWARDS_TIMESTAMPS;
  }

  getTimeUntilClaimStart(): string {
    const secondsUntilStart = environment.REWARDS_CLAIMABLE_START - this.reloaderService.currentTimestamp;
    const daysUntilStart = Math.floor(secondsUntilStart / Times.DAY_IN_SECONDS);

    if (daysUntilStart === 0) {
      const hoursUntilStart = Math.floor(secondsUntilStart / Times.HOUR_IN_SECONDS);

      if (hoursUntilStart === 0) {
        const minutesUntilStart = Math.floor(secondsUntilStart / Times.MINUTE_IN_SECONDS);
        return minutesUntilStart + " minutes";
      } else {
        return hoursUntilStart + " hours";
      }
    } else {
      return daysUntilStart + " days";
    }
  }

  getUserMarketRewards(): BigNumber {
    return this.persistenceService.userAccumulatedOmmRewards?.reserve.total ?? new BigNumber("0");
  }

  getUserLockingRewards(): BigNumber {
    return this.persistenceService.userAccumulatedOmmRewards?.OMMLocking?.total ?? new BigNumber("0");
  }

  getUserLiquidityRewards(): BigNumber {
    return this.persistenceService.userAccumulatedOmmRewards?.liquidity?.total ?? new BigNumber("0");
  }

  userHasStakedToPool(poolData: UserPoolData): boolean {
    return poolData.userStakedBalance.isGreaterThan(Utils.ZERO);
  }

  userHasAvailableStakeToPool(poolData: UserPoolData): boolean {
    return poolData.userAvailableBalance.isGreaterThan(Utils.ZERO);
  }

  getAllPoolsData(): PoolData[] {
    return this.persistenceService.allPools ?? [];
  }

  getUserPoolsData(): UserPoolData[] {
    return this.persistenceService.userPools ?? [];
  }

  getUserStakedPoolsData(): UserPoolData[] {
    return this.persistenceService.userPools?.filter(pool => pool.userStakedBalance.isGreaterThan(Utils.ZERO));
  }

  getUserPoolsAvailableData(): UserPoolData[] {
    return this.persistenceService.userPools?.filter(pool => pool.userAvailableBalance.isGreaterThan(Utils.ZERO)
      && pool.userStakedBalance.isZero());
  }

  userHasStakedOrAvailableToAnyPool(): boolean {
    for (const poolData of this.getUserPoolsData()) {
      if (poolData.userStakedBalance.isGreaterThan(Utils.ZERO) || poolData.userAvailableBalance.isGreaterThan(Utils.ZERO)) {
        return true;
      }
    }

    return false;
  }

  userHasStakedAnyPool(): boolean {
    for (const poolData of this.getUserPoolsData()) {
      if (poolData.userStakedBalance.isGreaterThan(Utils.ZERO)) {
        return true;
      }
    }

    return false;
  }

  getUserOmmLockingDailyRewards(): BigNumber {
    return this.calculationService.calculateUserDailyLockingOmmRewards();
  }

  userHasLpTokenAvailableOrHasStaked(poolId: BigNumber): boolean {
    return this.persistenceService.getUserPoolStakedAvailableBalance(poolId).isGreaterThan(Utils.ZERO)
      || this.persistenceService.getUserPoolStakedBalance(poolId).isGreaterThan(Utils.ZERO);
  }

  getTotalSuppliedBase(poolData: PoolData): BigNumber {
    return this.calculationService.calculatePoolTotalSupplied(poolData).dp(0, BigNumber.ROUND_HALF_CEIL);
  }

  getUserSuppliedBase(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolSupplied(poolData);
  }

  getTotalSuppliedQuote(poolData: PoolData): BigNumber {
    return this.calculationService.calculatePoolTotalSupplied(poolData, false).dp(0, BigNumber.ROUND_HALF_CEIL);
  }

  getTotalLpTokens(poolData: PoolData): BigNumber {
    return poolData.totalStakedBalance.dp(0, BigNumber.ROUND_HALF_CEIL);
  }

  getUserSuppliedQuote(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolSupplied(poolData, false);
  }

  getDailyRewards(poolData: PoolData): BigNumber {
    return this.calculationService.calculateDailyRewardsForPool(poolData);
  }

  getUserDailyRewards(poolData: UserPoolData): BigNumber {
    const userDailyOmmRewards: any = this.persistenceService.userDailyOmmRewards;
    if (userDailyOmmRewards) {
      return userDailyOmmRewards[poolData.getCleanPoolName()] ?? new BigNumber(0);
    } else {
      return new BigNumber(0);
    }
  }

  getUserDailyRewardsUSD(poolData: UserPoolData): BigNumber {
    return this.getUserDailyRewards(poolData).multipliedBy(this.persistenceService.ommPriceUSD);
  }

  getTotalDailyRewards(): BigNumber {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.total ?? new BigNumber("0");
  }

  getDailyMarketRewards(): BigNumber {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.total ?? new BigNumber("0");
  }

  getDailyOmmLockingRewards(): BigNumber {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.OMMLocking?.total ?? new BigNumber("0");
  }

  getDailyLiquidityRewards(): BigNumber {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.liquidity?.total ?? new BigNumber("0");
  }

  getDailyRewardsUSD(poolData: PoolData): BigNumber {
    return this.calculationService.calculateDailyRewardsForPool(poolData).multipliedBy(this.persistenceService.ommPriceUSD);
  }

  getPoolLiquidityApr(poolData: PoolData): BigNumber {
    return this.calculationService.calculatePoolLiquidityApr(poolData);
  }

  getUserPoolLiquidityApr(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolLiquidityApr(poolData);
  }

  isAllPoolsActive(): boolean {
    return this.activeLiquidityPoolView === ActiveLiquidityPoolsView.ALL_POOLS;
  }

  isAllLiquidityOverviewActive(): boolean {
    return this.activeLiquidityOverview === ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  getUserOmmRewardsBalance(): BigNumber {
    return this.persistenceService.userAccumulatedOmmRewards?.total ?? new BigNumber("0");
  }

  shouldHideYourPoolsHeader(): boolean {
    return this.isAllPoolsActive() || !this.userHasStakedAnyPool();
  }


  /**
   * BOOSTED OMM
   */

  lockingApr(): BigNumber {
    let lockingApr;
    if (this.userLoggedIn() && this.userHasLockedOmm()) {
      lockingApr = this.calculationService.calculateUserLockingApr();
    } else {
      lockingApr = this.calculationService.calculateLockingApr();
    }

    return lockingApr.gt(1) ? lockingApr.dp(0) : lockingApr;
  }

  showBoostedOmmDailyRewardsOmmAmount(): boolean {
    return this.userLoggedIn() && (this.userHasLockedOmm() || this.lockAdjustActive);
  }

  userHasLockedOmm(): boolean {
    return this.persistenceService.getUsersLockedOmmBalance().gt(0);
  }

  userLockedOmmBalance(): BigNumber {
    return this.persistenceService.getUsersLockedOmmBalance();
  }

  liquidityMultipliersAreEqual(): boolean {
    return this.liquidityBoosterData ?  this.liquidityBoosterData.from.eq(this.liquidityBoosterData.to) : false;
  }

  marketMultipliersAreEqual(): boolean {
    return this.marketBoosterData?.from.eq(this.marketBoosterData?.to) ?? false;
  }

  updateLiquidityAndMarketBoosters(newLockedOmmAmount: BigNumber): void {
    this.updateDynamicMarketBoosters(newLockedOmmAmount);
    this.updateDynamicLiquidityBoosters(newLockedOmmAmount);
  }

  updateDynamicLiquidityBoosters(newLockedOmmAmount: BigNumber): void {
    console.log("updateDynamicLiquidityBoosters....");
    let min = new BigNumber(-1);
    let max = new BigNumber(-1);

    this.persistenceService.userPoolsDataMap.forEach((value: UserPoolData, poolId: string) => {
      if (!value.userStakedBalance.isZero()) {
        const newLiquidityMultiplier = this.calculateDynamicLiquidityMultiplier(newLockedOmmAmount, poolId,
          this.ommLockingComponent.currentLockPeriodDate());
        const oldLiquidityMultiplier = this.persistenceService.userLiquidityPoolMultiplierMap.get(poolId)!;
        const oldBooster = this.liquidityBoosterData?.liquidityBoosterMap.get(poolId) ?? new BigNumber(0);
        const newLiquidityBooster = newLiquidityMultiplier.dividedBy(oldLiquidityMultiplier).multipliedBy(oldBooster);

        console.log(`Pool = ${value.getCleanPoolName()}`);
        console.log(`newLiquidityMultiplier = ${newLiquidityMultiplier}`);
        console.log(`oldLiquidityMultiplier = ${oldLiquidityMultiplier}`);
        console.log(`oldBooster = ${oldBooster}`);
        console.log(`newLiquidityBooster = ${newLiquidityBooster}`);

        if (newLiquidityBooster.lt(min) || min.eq(-1)) {
          min = newLiquidityBooster;
        }
        if (newLiquidityBooster.gt(max) || max.eq(-1)) {
          max = newLiquidityBooster;
        }
      }
    });

    this.setText(this.liquidityBoosterFromEl, this.tooUSLocaleString(min.dp(2, BigNumber.ROUND_HALF_CEIL)) + " x");
    this.setText(this.liquidityBoosterToEl, this.tooUSLocaleString(max.dp(2, BigNumber.ROUND_HALF_CEIL)) + " x");
  }

  updateDynamicMarketBoosters(newLockedOmmAmount: BigNumber): void {
    console.log("updateDynamicMarketBoosters....");
    let min = new BigNumber(-1);
    let max = new BigNumber(-1);

    supportedAssetsMap.forEach((value: Asset, assetTag: AssetTag) => {
      if (!this.persistenceService.getUserSuppliedAssetBalance(assetTag).isZero()) {
        const newSupplyMultiplier = this.calculateDynamicSupplyMarketMultiplier(newLockedOmmAmount, assetTag,
          this.ommLockingComponent.currentLockPeriodDate());
        const oldSupplyMultiplier = this.persistenceService.userMarketSupplyMultiplierMap.get(assetTag)!;
        const oldBooster = this.marketBoosterData?.supplyBoosterMap.get(assetTag) ?? new BigNumber(0);
        const newSupplyBooster = newSupplyMultiplier.dividedBy(oldSupplyMultiplier).multipliedBy(oldBooster);

        console.log(`Asset = ${assetTag}`);
        console.log(`newSupplyMultiplier = ${newSupplyMultiplier}`);
        console.log(`oldSupplyMultiplier = ${oldSupplyMultiplier}`);
        console.log(`oldBooster = ${oldBooster}`);
        console.log(`newSupplyBooster = ${newSupplyBooster}`);

        if (newSupplyBooster.lt(min) || min.eq(-1)) {
          min = newSupplyBooster;
        }
        if (newSupplyBooster.gt(max) || max.eq(-1)) {
        max = newSupplyBooster;
        }
      }

      if (!this.persistenceService.getUserBorrAssetBalance(assetTag).isZero()) {
        const newBorrowMultiplier = this.calculateDynamicBorrowMarketMultiplier(newLockedOmmAmount, assetTag,
          this.ommLockingComponent.currentLockPeriodDate());
        const oldBorrowMultiplier = this.persistenceService.userMarketBorrowMultiplierMap.get(assetTag)!;
        const oldBooster = this.marketBoosterData?.borrowBoosterMap.get(assetTag) ?? new BigNumber(0);
        const newBorrowBooster = newBorrowMultiplier.dividedBy(oldBorrowMultiplier).multipliedBy(oldBooster);
        console.log(`Asset = ${assetTag}`);
        console.log(`newBorrowMultiplier = ${newBorrowMultiplier}`);
        console.log(`oldBorrowMultiplier = ${oldBorrowMultiplier}`);
        console.log(`oldBooster = ${oldBooster}`);
        console.log(`newBorrowBooster = ${newBorrowBooster}`);

        if (newBorrowBooster.lt(min) || min.eq(-1)) {
          min = newBorrowBooster;
        }
        if (newBorrowBooster.gt(max) || max.eq(-1)) {
          max = newBorrowBooster;
        }
      }
    });

    this.setText(this.marketBoosterFromEl, this.tooUSLocaleString(min.dp(2, BigNumber.ROUND_HALF_CEIL)) + " x");
    this.setText(this.marketBoosterToEl, this.tooUSLocaleString(max.dp(2, BigNumber.ROUND_HALF_CEIL)) + " x");
  }

  calculateDynamicBorrowMarketMultiplier(newLockedOmmAmount: BigNumber, assetTag: AssetTag, lockDate: LockDate): BigNumber {
    const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
    const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
    const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
    return this.calculationService.calculateDynamicMarketRewardsBorrowMultiplier(assetTag, userbOMMBalance);
  }

  calculateDynamicSupplyMarketMultiplier(newLockedOmmAmount: BigNumber, assetTag: AssetTag, lockDate: LockDate): BigNumber {
    const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
    const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
    const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
    return this.calculationService.calculateDynamicMarketRewardsSupplyMultiplier(assetTag, userbOMMBalance);
  }

  calculateDynamicLiquidityMultiplier(newLockedOmmAmount: BigNumber, poolId: string,  lockDate: LockDate): BigNumber {
    const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
    const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
    const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
    return this.calculationService.calculateDynamicLiquidityRewardsMultiplier(new BigNumber(poolId), userbOMMBalance);
  }

  fromToIsEmpty(fromTo?: { from: BigNumber, to: BigNumber}): boolean {
    if (!fromTo || !this.userLoggedIn()) {
      return true;
    }

    return (fromTo.from.isZero() && fromTo.to.isZero()) || fromTo.from.isNaN() || fromTo.to.isNaN();
  }

  onLockUntilDateClick(date: LockDate): void {
    // update dynamic daily OMM rewards based on the newly selected lock date
    this.updateUserDailyRewards(this.ommLockingComponent.dynamicLockedOmmAmount, date);

    // update dynamic liquidity and market boosters
    this.updateLiquidityAndMarketBoosters(this.ommLockingComponent.dynamicLockedOmmAmount);

    // update user lock APR
    this.updateUserLockApr(this.ommLockingComponent.dynamicLockedOmmAmount);
  }

  updateUserDailyRewards(lockedOmm: BigNumber, date: LockDate): void {
    const dailyUsersOmmLockingRewards = this.calculationService.calculateUserDailyLockingOmmRewards(lockedOmm, date);

    // set daily rewards text to dynamic value by replacing inner HTML
    this.setText(this.lockDailyRewardsEl, this.tooUSLocaleString(dailyUsersOmmLockingRewards.dp(2))
      + (dailyUsersOmmLockingRewards.isGreaterThan(Utils.ZERO) ? " OMM " : ""));
  }

  updateUserLockApr(lockedOmm: BigNumber): void {
    let userLockApr = this.calculationService.calculateUserLockingApr(lockedOmm, this.ommLockingComponent.currentLockPeriodDate());
    userLockApr = userLockApr.gt(1) ? userLockApr.dp(0) : userLockApr;

    // set user lock apr text to dynamic value by replacing inner HTML
    this.setText(this.lockAprEl, this.to2DecimalRoundedOffPercentString(userLockApr)
      + (userLockApr.isGreaterThan(Utils.ZERO) ? " APR " : ""));
  }
}
