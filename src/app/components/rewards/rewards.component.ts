import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ActiveLiquidityOverview, ActiveLiquidityPoolsView} from "../../models/ActiveViews";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Utils} from "../../common/utils";
import {ModalType} from "../../models/ModalType";
import {AssetAction, ClaimOmmDetails} from "../../models/AssetAction";
import {Asset, AssetClass, AssetName, AssetTag, supportedAssetsMap} from "../../models/Asset";
import {ModalService} from "../../services/modal/modal.service";
import {PoolData} from "../../models/PoolData";
import {CalculationsService} from "../../services/calculations/calculations.service";
import log from "loglevel";
import {UserPoolData} from "../../models/UserPoolData";
import {ModalAction} from "../../models/ModalAction";
import {NotificationService} from "../../services/notification/notification.service";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {environment} from "../../../environments/environment";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {lockedDatesToMilliseconds, lockedUntilDateOptions, Times} from "../../common/constants";
import BigNumber from "bignumber.js";
import {normalFormat} from "../../common/formats";
import {LockingAction} from "../../models/LockingAction";

declare var $: any;
declare var noUiSlider: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './rewards.component.html',
  styleUrls: ['./rewards.component.css']
})
export class RewardsComponent extends BaseClass implements OnInit, AfterViewInit {

  toggleYourPoolsEl: any; @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any; @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }
  private inputLockOmm!: any; @ViewChild("lockInput")set c(c: ElementRef) {this.inputLockOmm = c.nativeElement; }
  private sliderStake!: any; @ViewChild("stkSlider")set d(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  lockDailyRewardsEl: any; @ViewChild("lockDailyRew") set e(e: ElementRef) {this.lockDailyRewardsEl = e?.nativeElement; }


  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  userLockedOmmBalance = new BigNumber(this.persistenceService.getUsersLockedOmmBalance());

  lockAdjustActive = false; // flag that indicates whether the locked adjust is active (confirm and cancel shown)

  dailyOmmLockingRewards = new BigNumber("0");

  lockedUntilDateOptions = lockedUntilDateOptions;
  selectedLockTime = Times.WEEK_IN_MILLISECONDS; // default to 1 week
  userHasSelectedLockTime = false;

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
    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initStakeSlider();

    this.setLockingDailyRewards();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  /**
   * Click event handlers
   */

  onClaimOmmRewardsClick(): void {
    this.onLockAdjustCancelClick();
    this.lockAdjustActive = false;

    const rewards = (this.persistenceService.userOmmRewards?.total ?? new BigNumber("0")).dp(2);

    if (rewards.isLessThanOrEqualTo(Utils.ZERO)) {
      return;
    }

    const before = (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).dp(2);
    const after = Utils.add(before, rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS),
      before, after, rewards, undefined, new ClaimOmmDetails(this.persistenceService.userOmmRewards)));
  }

  onConfirmLockOmmClick(): void {
    log.debug(`onConfirmLockOmmClick Omm locked amount = ${this.userLockedOmmBalance}`);
    const before = this.persistenceService.getUsersLockedOmmBalance().dp(0);
    log.debug("before = ", before);
    const after = (this.userLockedOmmBalance ?? new BigNumber("0")).dp(0);
    log.debug("after = ", after);
    const diff = Utils.subtract(after, before);
    log.debug("Diff = ", diff);

    // if before and after equal show notification
    if (before.isEqualTo(after) && this.lockDate().eq(this.userCurrentLockedOmmEndInMilliseconds())) {
      this.notificationService.showNewNotification("No change in locked value.");
      return;
    }

    if (!this.selectedLockTime.isFinite() || this.selectedLockTime.lte(0)) {
      this.notificationService.showNewNotification("Please selected locking period.");
      return;
    }

    const unlockPeriod = this.lockDate();
    log.debug("unlockPeriod:", unlockPeriod);

    const lockingAction = new LockingAction(before, after, diff.abs(), unlockPeriod);

    if (diff.gte(Utils.ZERO)) {
      if (this.persistenceService.minOmmLockAmount.isGreaterThan(diff)
        && !unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {

        this.notificationService.showNewNotification(`Lock amount must be greater than ${this.persistenceService.minOmmLockAmount}`);
      }
      else if (before.gt(0) && after.gt(before) && this.lockDate().eq(this.userCurrentLockedOmmEndInMilliseconds())) {
        // increase lock amount
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_OMM, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else if (before.isEqualTo(after) && unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {
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

    this.sliderStake.removeAttribute("disabled");
  }

  // On "Cancel Lock up OMM" click
  onLockAdjustCancelClick(): void {
    this.lockAdjustActive = false;
    this.userHasSelectedLockTime = false;

    // Set your locked OMM slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
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
      this.sliderStake.noUiSlider.set(normalFormat.from(this.inputLockOmm.value));
    } else {
      this.sliderStake.noUiSlider.set(normalFormat.from("0"));
    }
  }

  /**
   * Subscriptions
   */

  private registerSubscriptions(): void {
    this.subscribeToLoginChange();
    this.subscribeToOmmTokenBalanceChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToAllAssetDistPercentagesChange();
    this.subscribeToTokenDistributionPerDayChange();
    this.subscribeToOmmPriceChange();
  }

  private subscribeToOmmTokenBalanceChange(): void {
    this.stateChangeService.userOmmTokenBalanceDetailsChange.subscribe((res: OmmTokenBalanceDetails) => {
      this.userOmmTokenBalanceDetails = res.getClone();

      // sliders max is sum of locked + available balance
      const sliderMax = Utils.add(this.persistenceService.getUsersLockedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.persistenceService.getUsersLockedOmmBalance().toNumber()],
        range: { min: 0, max: sliderMax.isGreaterThan(Utils.ZERO) ? sliderMax.dp(0).toNumber() : 1 }
      });

      this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.onLockAdjustCancelClick();
      this.collapseAllPoolTables();
    });
  }

  private subscribeToAllAssetDistPercentagesChange(): void {
    this.stateChangeService.allAssetDistPercentagesChange$.subscribe((res) => {
      this.setLockingDailyRewards();
    });
  }

  private subscribeToTokenDistributionPerDayChange(): void {
    this.stateChangeService.tokenDistributionPerDayChange$.subscribe((res) => {
      this.setLockingDailyRewards();
    });
  }

  private subscribeToOmmPriceChange(): void {
    this.stateChangeService.ommPriceChange$.subscribe((res) => {
      this.setLockingDailyRewards();
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

        // Reset staking values
        this.setLockingDailyRewards();
      }
    });
  }

  /**
   * Getters, setters and checks
   */

  initStakeSlider(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    const usersLockedOmmBalance = this.persistenceService.getUsersLockedOmmBalance();
    const userOmmAvailableBalance = this.persistenceService.getUsersAvailableOmmBalance();
    const max = Utils.add(usersLockedOmmBalance, userOmmAvailableBalance).dp(0);

    // create Stake slider
    if (this.sliderStake) {
      noUiSlider.create(this.sliderStake, {
        start: 0,
        padding: 0,
        connect: 'lower',
        range: {
          min: [0],
          max: [max.isZero() ? 1 : max.toNumber()]
        },
        step: 1,
      });
    }

    // slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = new BigNumber(values[handle]);

      if (value.lt(this.persistenceService.getUsersLockedOmmBalance())) {
        this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
        return;
      }

      if (this.lockDailyRewardsEl && this.userLoggedIn()) {
        const dailyUsersOmmLockingRewards = this.calculationService.calculateUserDailyLockingOmmRewards(value);
        this.setText(this.lockDailyRewardsEl, this.formatNumberToUSLocaleString(dailyUsersOmmLockingRewards.dp(2))
          + (dailyUsersOmmLockingRewards.isGreaterThan(Utils.ZERO) ? " OMM " : ""));
      }

      // Update Omm stake input text box
      this.inputLockOmm.value = normalFormat.to(parseFloat(values[handle]));

      if (this.userOmmTokenBalanceDetails) {
        this.userLockedOmmBalance = value;
      }
    });
  }

  getLockSliderMax(): BigNumber {
    // sliders max is sum of locked + available balance
    return Utils.add(this.persistenceService.getUsersLockedOmmBalance(),
      this.persistenceService.getUsersAvailableOmmBalance());
  }


  shouldHideClaimBtn(): boolean {
    const userOmmRewardsTotal = this.persistenceService.userOmmRewards?.total ?? new BigNumber("0");
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
    return this.persistenceService.userOmmRewards?.reserve.total ?? new BigNumber("0");
  }

  getUserLockingRewards(): BigNumber {
    return this.persistenceService.userOmmRewards?.locking?.total ?? new BigNumber("0");
  }

  getUserLiquidityRewards(): BigNumber {
    return this.persistenceService.userOmmRewards?.liquidity?.total ?? new BigNumber("0");
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
    return this.calculationService.calculatePoolTotalSupplied(poolData);
  }

  getUserSuppliedBase(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolSupplied(poolData);
  }

  getTotalSuppliedQuote(poolData: PoolData): BigNumber {
    return this.calculationService.calculatePoolTotalSupplied(poolData, false);
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

  getLiquidityApy(poolData: PoolData): BigNumber {
    return this.calculationService.calculatePoolLiquidityApy(poolData);
  }

  isAllPoolsActive(): boolean {
    return this.activeLiquidityPoolView === ActiveLiquidityPoolsView.ALL_POOLS;
  }

  isAllLiquidityOverviewActive(): boolean {
    return this.activeLiquidityOverview === ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  getUserOmmRewardsBalance(): BigNumber {
    return this.persistenceService.userOmmRewards?.total ?? new BigNumber("0");
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
        return this.userCurrentLockedOmmEndInMilliseconds().plus(this.selectedLockTime);
      } else {
        return this.userCurrentLockedOmmEndInMilliseconds();
      }
    } else {
      return Utils.timestampNowMilliseconds().plus(this.selectedLockTime);
    }
  }

  setLockingDailyRewards(): void {
    this.dailyOmmLockingRewards = this.calculationService.calculateDailyOmmLockingRewards();
  }

  lockingApy(): BigNumber {
    return this.calculationService.calculateLockingApy();
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
    const min = new BigNumber("25.9");
    const max = new BigNumber("97");
    const percent = this.persistenceService.getUsersLockedOmmBalance().dividedBy(this.getLockSliderMax());
    const res = min.plus(max.minus(min).multipliedBy(percent)).dp(2);
    return { left: res.toString() + "%" };
  }

  showBoostedOmmDailyRewardsOmmAmount(): boolean {
    return this.userLoggedIn() && (this.userHasDynamicLockedOmm() || this.lockAdjustActive);
  }

  userHasDynamicLockedOmm(): boolean {
    return this.userLockedOmmBalance.gt(0);
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

  usersBoostedOmmMarketRewards(): { from: BigNumber, to: BigNumber} {
    if (!this.userLoggedIn()) {
      return { from: new BigNumber(0), to: new BigNumber(0)};
    }

    const marketRewards: BigNumber[] = [];

    supportedAssetsMap.forEach((value: Asset, key: AssetTag) => {
      marketRewards.push(this.calculationService.calculateMarketRewardsSupplyMultiplier(key));
      marketRewards.push(this.calculationService.calculateMarketRewardsBorrowMultiplier(key));
    });

    let min = new BigNumber(-1);
    let max = new BigNumber(-1);

    marketRewards.forEach(multiplier => {
      if (multiplier.lt(min) || min.eq(-1)) {
        min = multiplier;
      }

      if (multiplier.gt(max) || max.eq(-1)) {
        max = multiplier;
      }
    });

    return { from: min, to: max};
  }

  usersBoostedOmmLiquidityRewards(): { from: BigNumber, to: BigNumber} {
    if (!this.userLoggedIn()) {
      return { from: new BigNumber(0), to: new BigNumber(0)};
    }

    const liquidity: BigNumber[] = [];

    this.persistenceService.userPoolsDataMap.forEach((value: UserPoolData, poolId: string) => {
      liquidity.push(this.calculationService.calculateliquidityRewardsMultiplier(new BigNumber(poolId)));
    });

    let min = new BigNumber(-1);
    let max = new BigNumber(-1);

    liquidity.forEach(multiplier => {
      if (multiplier.lt(min) || min.eq(-1)) {
        min = multiplier;
      }

      if (multiplier.gt(max) || max.eq(-1)) {
        max = multiplier;
      }
    });

    return { from: min, to: max};
  }

  fromToIsEmpty(fromTo: { from: BigNumber, to: BigNumber}): boolean {
    return (fromTo.from.isZero() && fromTo.to.isZero()) || fromTo.from.isNaN() || fromTo.to.isNaN();
  }

  isMaxOmmLocked(): boolean {
    return new BigNumber(this.sliderStake?.noUiSlider?.options.range.max)
      .isEqualTo(this.userOmmTokenBalanceDetails?.availableBalance ?? -1);
  }

  onLockedDateDropdownClick(): void {
    $(".dropdown-content.locked-selector").toggleClass('active');
  }

  onLockUntilDateClick(date: string): void {
    this.selectedLockTime = lockedDatesToMilliseconds.get(date) ?? Times.WEEK_IN_MILLISECONDS;
    this.userHasSelectedLockTime = true;
  }

  userBOMMbalance(): BigNumber {
    return this.persistenceService.userbOmmBalance;
  }
}
