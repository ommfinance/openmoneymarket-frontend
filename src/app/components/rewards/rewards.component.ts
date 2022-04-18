import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import log from "loglevel";
import {UserPoolData} from "../../models/classes/UserPoolData";
import {ModalAction} from "../../models/classes/ModalAction";
import {NotificationService} from "../../services/notification/notification.service";
import {OmmTokenBalanceDetails} from "../../models/classes/OmmTokenBalanceDetails";
import {environment} from "../../../environments/environment";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {lockedDatesToMilliseconds, lockedDateTobOmmPerOmm, lockedUntilDateOptions, Times} from "../../common/constants";
import BigNumber from "bignumber.js";
import {normalFormat} from "../../common/formats";
import {LockingAction} from "../../models/classes/LockingAction";
import {LockDate} from "../../models/enums/LockDate";
import {BoostedOmmSliderComponent} from "../boosted-omm-slider/boosted-omm-slider.component";

declare var $: any;
declare var noUiSlider: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  TAG = "[RewardsComponent]";

  toggleYourPoolsEl: any; @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any; @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }
  private inputLockOmm!: any; @ViewChild("lockInput")set c(c: ElementRef) {this.inputLockOmm = c.nativeElement; }
  lockDailyRewardsEl: any; @ViewChild("lockDailyRew") set e(e: ElementRef) {this.lockDailyRewardsEl = e?.nativeElement; }

  @ViewChild(BoostedOmmSliderComponent) lockOmmSliderCmp!: BoostedOmmSliderComponent;


  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  userLockedOmmBalance = this.persistenceService.getUsersLockedOmmBalance().toNumber();

  lockAdjustActive = false; // flag that indicates whether the locked adjust is active (confirm and cancel shown)

  lockedUntilDateOptions = lockedUntilDateOptions;
  selectedLockTimeInMillisec = Times.WEEK_IN_MILLISECONDS; // default to 1 week
  selectedLockTime = LockDate.WEEK;
  userHasSelectedLockTime = false;

  marketMultipliers?: { from: BigNumber, to: BigNumber};
  liquidityMultipliers?: { from: BigNumber, to: BigNumber};
  activeLockedOmmAmount: BigNumber = new BigNumber(0);


  constructor(public persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private modalService: ModalService,
              private calculationService: CalculationsService,
              private notificationService: NotificationService,
              private cd: ChangeDetectorRef,
              public reloaderService: ReloaderService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    log.debug(this.TAG + " ngOnInit() called");

    this.initValues();

    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {
    log.debug(this.TAG + " ngAfterViewInit() called");

    this.initLockSlider();
  }

  ngOnDestroy(): void {
    log.debug(this.TAG + " ngOnDestroy() called");
  }

  initValues(): void {
    this.marketMultipliers = this.calculationService.calculateUserbOmmMarketMultipliers();
    this.liquidityMultipliers = this.calculationService.calculateUserbOmmLiquidityMultipliers();
  }



  /**
   * Click event handlers
   */

  onClaimOmmRewardsClick(): void {
    this.onLockAdjustCancelClick();
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

  onConfirmLockOmmClick(): void {
    log.debug(`onConfirmLockOmmClick Omm locked amount = ${this.userLockedOmmBalance}`);
    const before = this.persistenceService.getUsersLockedOmmBalance().toNumber();
    const after = this.userLockedOmmBalance;
    const diff = after - before;

    // if before and after equal show notification
    if (before === after && this.lockDate().eq(this.userCurrentLockedOmmEndInMilliseconds())) {
      this.notificationService.showNewNotification("No change in locked value.");
      return;
    }

    if (!this.selectedLockTimeInMillisec.isFinite() || this.selectedLockTimeInMillisec.lte(0)) {
      this.notificationService.showNewNotification("Please selected locking period.");
      return;
    }

    const unlockPeriod = this.lockDate();
    log.debug("unlockPeriod:", unlockPeriod);

    const lockingAction = new LockingAction(before, after, Math.abs(diff), unlockPeriod);

    if (diff >= 0) {
      if (this.persistenceService.minOmmLockAmount.isGreaterThan(diff)
        && !unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {

        this.notificationService.showNewNotification(`Lock amount must be greater than ${this.persistenceService.minOmmLockAmount}`);
      }
      else if (before > 0 && after > before && unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {
        // increase both locked amount and unlock period if lock amount and unlock period are greater than current
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_TIME_AND_AMOUNT, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else if (before > 0 && after > before && unlockPeriod.eq(this.userCurrentLockedOmmEndInMilliseconds())) {
        // increase lock amount only if new one is greater and unlock period is same as current
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_OMM, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else if (before === after && unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_TIME, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else {
        this.modalService.showNewModal(ModalType.LOCK_OMM, undefined, undefined, undefined, undefined,
          lockingAction);
      }
    } else {
      this.notificationService.showNewNotification("Lock amount can not be lower than locked amount.");
    }
  }

  userCurrentLockedOmmEndInMilliseconds(): BigNumber {
    return this.persistenceService.userLockedOmm?.end.dividedBy(1000) ?? new BigNumber(0);
  }

  // On "Lock up OMM" or "Adjust" click
  onLockAdjustClick(): void {
    this.onLockAdjustCancelClick();
    this.collapseAllPoolTables();
    this.lockAdjustActive = true;
    this.lockOmmSliderCmp.enableSlider();
  }

  // On "Cancel Lock up OMM" click
  onLockAdjustCancelClick(): void {
    this.lockAdjustActive = false;
    this.userHasSelectedLockTime = false;

    // Set your locked OMM slider to the initial value
    this.lockOmmSliderCmp.disableSlider();
    this.lockOmmSliderCmp.setSliderValue(this.persistenceService.getUsersLockedOmmBalance().toNumber());
  }

  onYourLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.YOUR_LIQUIDITY;
  }

  onAllLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  onYourPoolsClick(): void {
    this.onLockAdjustCancelClick();
    this.collapseAllPoolTables();
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.YOUR_POOLS;
  }

  onAllPoolsClick(): void {
    this.onLockAdjustCancelClick();
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
    this.onLockAdjustCancelClick();

    // commit event to state change
    this.stateChangeService.poolClickCUpdate(poolData);

    $(`.pool.${poolData.getPairClassName()}`).toggleClass('active');
    $(`.pool-${poolData.getPairClassName()}-expanded`).slideToggle();
  }

  // Stake input updates the slider
  onInputLockChange(): void {
    log.debug("onInputLockChange: " + this.inputLockOmm.value);
    if (+normalFormat.from(this.inputLockOmm.value)) {
      this.lockOmmSliderCmp.setSliderValue(normalFormat.from(this.inputLockOmm.value));
    } else {
      this.lockOmmSliderCmp.setSliderValue(0);
    }
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
      this.updateLockSliderValues();
      this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    });
  }

  // public subscribeToAfterCoreDataReload(): void {
  //   this.stateChangeService.afterCoreDataReload$.subscribe(() => {
  //     this.initValues();
  //     this.updateLockSliderValues();
  //     this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
  //   });
  // }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.onLockAdjustCancelClick();
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

  initLockSlider(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    const userOmmAvailableBalance = this.persistenceService.getUsersAvailableOmmBalance();
    const max = userOmmAvailableBalance.plus(this.userLockedOmmBalance).dp(0).toNumber();

    // create Stake slider
    this.lockOmmSliderCmp.createAndInitSlider(this.userLockedOmmBalance, max);
  }

  handleLockSliderValueUpdate(value: number): void {
    const bigNumValue = new BigNumber(value);

    if (this.userLoggedIn()) {
      // this.marketMultipliers = this.calculationService.calculateUserbOmmMarketMultipliers(bigNumValue); TODO: enable on dynamic part
      // this.liquidityMultipliers = this.userbOmmLiquidityMultipliers(bigNumValue);
      this.activeLockedOmmAmount = bigNumValue;
      this.userLockedOmmBalance = value;

      // Update User daily Omm rewards
      if (this.lockDailyRewardsEl) {
        this.updateUserDailyRewards(bigNumValue);
      }
    }

    // Update Omm stake input text box
    this.inputLockOmm.value = normalFormat.to(value);
  }

  private updateLockSliderValues(): void {
    // sliders max is sum of locked + available balance
    const sliderMax = this.persistenceService.getUsersAvailableOmmBalance().plus(this.userLockedOmmBalance);

    this.lockOmmSliderCmp.updateSliderValues(sliderMax.toNumber(), this.userLockedOmmBalance);
    this.lockOmmSliderCmp.setSliderValue(this.userLockedOmmBalance);
  }

  getLockSliderMax(): BigNumber {
    // sliders max is sum of locked + available balance
    return this.persistenceService.getUsersLockedOmmBalance().plus(this.persistenceService.getUsersAvailableOmmBalance());
  }


  shouldHideClaimBtn(): boolean {
    const userOmmRewardsTotal = this.persistenceService.userAccumulatedOmmRewards?.total ?? new BigNumber("0");
    return userOmmRewardsTotal.isLessThanOrEqualTo(Utils.ZERO) || !this.persistenceService.userOmmTokenBalanceDetails;
  }

  shouldHideLockedOmmThreshold(): boolean {
    return !this.userLoggedIn() || !this.userHasLockedOmm() || !this.lockAdjustActive;
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

  userHasOmmTokens(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? Utils.ZERO).isGreaterThan(Utils.ZERO);
  }

  userHasMoreThanOneOmmToken(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).isGreaterThan(new BigNumber("1"));
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
    return this.calculationService.calculateUserDailyRewardsForPool(poolData);
  }

  getUserDailyRewardsUSD(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserDailyRewardsForPool(poolData).multipliedBy(this.persistenceService.ommPriceUSD);
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

  lockDate(): BigNumber {
    if (this.userCurrentLockedOmmEndInMilliseconds().gt(0)) {
      if (this.userHasSelectedLockTime) {
        return this.userCurrentLockedOmmEndInMilliseconds().plus(this.selectedLockTimeInMillisec);
      } else {
        return this.userCurrentLockedOmmEndInMilliseconds();
      }
    } else {
      return Utils.timestampNowMilliseconds().plus(this.selectedLockTimeInMillisec);
    }
  }

  lockingApr(): BigNumber {
    const lockingApr = this.calculationService.calculateLockingApr();
    return lockingApr.gt(1) ? lockingApr.dp(0) : lockingApr;
  }

  boostedOmmPanelMessage(): string {
    if (!this.userLoggedIn()) {
      // signed out / hold no OMM
      return "Earn or buy OMM, then lock it up here to boost your earning potential and voting power.";
    } else if (this.userLoggedIn() && (this.userHasLockedOmm() || this.userHasOmmTokens())) {
      // unlocked OMM (no market or LP participation)
      return "Lock up OMM to boost your earning potential.";
    }

    return "Earn or buy OMM, then lock it up here to boost your earning potential and voting power.";
  }

  getLeftLockedThresholdPercentStyle(): any {
    const max = new BigNumber("96.7");
    const userLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const percent = userLockedOmm.dividedBy(userLockedOmm.plus(this.persistenceService.getUsersAvailableOmmBalance()));
    const res = max.multipliedBy(percent).dp(2);
    return { left: res.toString() + "%" };
  }

  showBoostedOmmDailyRewardsOmmAmount(): boolean {
    return this.userLoggedIn() && (this.userHasDynamicLockedOmm() || this.lockAdjustActive);
  }

  userHasDynamicLockedOmm(): boolean {
    return this.userLockedOmmBalance > 0;
  }

  userHasLockedOmm(): boolean {
    return this.persistenceService.getUsersLockedOmmBalance().gt(0);
  }

  shouldHideBoostedSlider(): boolean {
    return !this.userLoggedIn() || !this.userHasOmmTokens() || !this.userHasMoreThanOneOmmToken();
  }

  boostAdjustLabel(): string {
    if (this.userHasLockedOmm()) {
      return "Adjust";
    } else {
      return "Lock up OMM";
    }
  }

  userbOmmAssetSupplyMarketMultiplier(assetTag: AssetTag): BigNumber {
    if (!this.userLoggedIn()) {
      return new BigNumber(0);
    }

    return this.calculationService.calculateMarketRewardsSupplyMultiplier(assetTag);
  }

  userbOmmAssetBorrowMarketMultiplier(assetTag: AssetTag): BigNumber {
    if (!this.userLoggedIn()) {
      return new BigNumber(0);
    }

    return this.calculationService.calculateMarketRewardsBorrowMultiplier(assetTag);
  }

  // calculateDynamicBorrowMarketMultiplier(newLockedOmmAmount: BigNumber, lockDate: LockDate, assetTag: AssetTag): BigNumber {
  //   const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
  //   const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
  //   const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
  //   const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
  //   return this.calculationService.calculateDynamicMarketRewardsBorrowMultiplier(assetTag, userbOMMBalance);
  // }
  //
  // calculateDynamicSupplyMarketMultiplier(newLockedOmmAmount: BigNumber, lockDate: LockDate, assetTag: AssetTag): BigNumber {
  //   const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
  //   const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
  //   const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
  //   const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
  //   return this.calculationService.calculateDynamicMarketRewardsSupplyMultiplier(assetTag, userbOMMBalance);
  // }

  marketMultipliersAreEqual(): boolean {
    return this.marketMultipliers?.from.eq(this.marketMultipliers?.to) ?? false;
  }

  marketMultipliersAreZero(): boolean {
    return (this.marketMultipliers?.from.isZero() && this.marketMultipliers?.to.isZero()) ?? false;
  }

  userbOmmPoolLiquidityMultiplier(poolId: BigNumber): BigNumber {
    if (!this.userLoggedIn()) {
      return new BigNumber(0);
    }

    return this.activeLockedOmmAmount ? this.calculateDynamicLiquidityMultiplier(this.activeLockedOmmAmount, this.selectedLockTime,
        poolId.toString()) : this.calculationService.calculateLiquidityRewardsMultiplier(poolId);
  }

  calculateDynamicLiquidityMultiplier(newLockedOmmAmount: BigNumber, lockDate: LockDate, poolId: string): BigNumber {
    const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
    const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
    const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(lockDate)).plus(currentUserbOmmBalance);
    return this.calculationService.calculateDynamicLiquidityRewardsMultiplier(new BigNumber(poolId), userbOMMBalance);
  }

  liquidityMultipliersAreEqual(): boolean {
    return this.liquidityMultipliers ?  this.liquidityMultipliers.from.eq(this.liquidityMultipliers.to) : false;
  }

  liquidityMultipliersAreZero(): boolean {
    return this.marketMultipliers ? this.marketMultipliers.from.isZero() && this.marketMultipliers.to.isZero() : false;
  }

  fromToIsEmpty(fromTo?: { from: BigNumber, to: BigNumber}): boolean {
    if (!fromTo || !this.userLoggedIn()) {
      return true;
    }

    return (fromTo.from.isZero() && fromTo.to.isZero()) || fromTo.from.isNaN() || fromTo.to.isNaN();
  }

  isMaxOmmLocked(): boolean {
    const sliderMax = this.lockOmmSliderCmp.getSliderMax();
    const userAvailOmmBalance = this.persistenceService.getUsersAvailableOmmBalance();
    return userAvailOmmBalance.eq(sliderMax);
  }

  onLockedDateDropdownClick(): void {
    $(".dropdown-content.locked-selector").toggleClass('active');
  }

  onLockUntilDateClick(date: LockDate): void {
    this.selectedLockTimeInMillisec = lockedDatesToMilliseconds.get(date) ?? Times.WEEK_IN_MILLISECONDS;
    this.selectedLockTime = date;
    this.userHasSelectedLockTime = true;

    // update dynamic daily OMM rewards based on the newly selected lock date
    this.updateUserDailyRewards(new BigNumber(this.userLockedOmmBalance));
  }

  updateUserDailyRewards(value: BigNumber): void {
    const dailyUsersOmmLockingRewards = this.calculationService.calculateUserDailyLockingOmmRewards(value, this.selectedLockTime);

    // set daily rewards text to dynamic value by replacing inner HTML
    this.setText(this.lockDailyRewardsEl, this.formatNumberToUSLocaleString(dailyUsersOmmLockingRewards.dp(2))
      + (dailyUsersOmmLockingRewards.isGreaterThan(Utils.ZERO) ? " OMM " : ""));
  }

  userBOMMbalance(): BigNumber {
    return this.persistenceService.userbOmmBalance;
  }
}
