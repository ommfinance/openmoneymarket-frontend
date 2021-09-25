import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
import {StakingAction} from "../../models/StakingAction";
import {NotificationService} from "../../services/notification/notification.service";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {environment} from "../../../environments/environment";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {Times} from "../../common/constants";
import BigNumber from "bignumber.js";
import {normalFormat} from "../../common/formats";

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
  private inputStakeOmm!: any; @ViewChild("stakeInput")set c(c: ElementRef) {this.inputStakeOmm = c.nativeElement; }
  private sliderStake!: any; @ViewChild("stkSlider")set d(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  stakeDailyRewEl: any; @ViewChild("stkDailyRew")set e(a: ElementRef) {this.stakeDailyRewEl = a.nativeElement; }
  private stakeAmount!: any; @ViewChild("ommStkAmount")set f(f: ElementRef) {this.stakeAmount = f.nativeElement; }

  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  stakeAdjustActive = false;

  dailyOmmRewards = new BigNumber("0");
  yourDailyRewards = new BigNumber("0");

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

    this.setStakingDailyRewards();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  /**
   * Click event handlers
   */

  onClaimOmmRewardsClick(): void {
    this.onStakeAdjustCancelClick();
    this.stakeAdjustActive = false;

    const rewards = (this.persistenceService.userOmmRewards?.total ?? new BigNumber("0")).dp(2);

    if (rewards.isLessThanOrEqualTo(Utils.ZERO)) {
      return;
    }

    const before = (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).dp(2);
    const after = Utils.add(before, rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS),
      before, after, rewards, undefined, new ClaimOmmDetails(this.persistenceService.userOmmRewards)));
  }

  // On OMM un-staking cancel click
  onCancelUnstakingClick(): void {
    const stakingAction = new StakingAction(Utils.ZERO, Utils.ZERO, this.persistenceService.getUserUnstakingOmmBalance0Rounded());
    this.modalService.showNewModal(ModalType.CANCEL_UNSTAKE_OMM_TOKENS, undefined, stakingAction);
  }

  onConfirmStakeClick(): void {
    log.debug(`onConfirmStakeClick Omm stake amount = ${this.userOmmTokenBalanceDetails?.stakedBalance}`);
    const before = this.persistenceService.getUsersStakedOmmBalance().dp(0);
    log.debug("before = ", before);
    const after = (this.userOmmTokenBalanceDetails?.stakedBalance ?? new BigNumber("0")).dp(0);
    log.debug("after = ", after);
    const diff = Utils.subtract(after, before);
    log.debug("Diff = ", diff);

    // if before and after equal show notification
    if (before.isEqualTo(after)) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const voteAction = new StakingAction(before, after, diff.abs());

    if (diff.isGreaterThan(Utils.ZERO)) {
      if (this.persistenceService.minOmmStakeAmount.isGreaterThan(diff)) {
        this.notificationService.showNewNotification(`Stake amount must be greater than ${this.persistenceService.minOmmStakeAmount}`);
      } else {
        this.modalService.showNewModal(ModalType.STAKE_OMM_TOKENS, undefined, voteAction);
      }
    } else {
      this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS, undefined, voteAction);
    }
  }

  // On "Stake" click
  onStakeAdjustClick(): void {
    this.onStakeAdjustCancelClick();
    this.collapseAllPoolTables();
    this.stakeAdjustActive = true;

    $(".stake-omm-actions-default").addClass('hide');
    this.sliderStake.removeAttribute("disabled");
  }

  // On "Cancel Stake" click
  onStakeAdjustCancelClick(): void {
    this.stakeAdjustActive = false;

    $(".stake-omm-actions-default").removeClass('hide');


    // Set your stake slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.getUsersStakedOmmBalance().toNumber());
  }

  onSignInClick(): void {
    this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  onYourLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.YOUR_LIQUIDITY;
  }

  onAllLiquidityClick(): void {
    this.activeLiquidityOverview = ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  onYourPoolsClick(): void {
    this.onStakeAdjustCancelClick();
    this.collapseAllPoolTables();
    this.activeLiquidityPoolView = ActiveLiquidityPoolsView.YOUR_POOLS;
  }

  onAllPoolsClick(): void {
    this.onStakeAdjustCancelClick();
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

    this.stakeAdjustActive = false;
    this.onStakeAdjustCancelClick();

    // commit event to state change
    this.stateChangeService.poolClickCUpdate(poolData);

    $(`.pool.${poolData.getPairClassName()}`).toggleClass('active');
    $(`.pool-${poolData.getPairClassName()}-expanded`).slideToggle();
  }

  // Stake input updates the slider
  onInputStakeOmmChange(): void {
    log.debug("onInputStakeOmmChange: " + this.inputStakeOmm.value);
    if (+normalFormat.from(this.inputStakeOmm.value)) {
      this.sliderStake.noUiSlider.set(normalFormat.from(this.inputStakeOmm.value));
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

      // sliders max is sum of staked + available balance
      const sliderMax = Utils.add(this.persistenceService.getUsersStakedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.userOmmTokenBalanceDetails.stakedBalance.dp(0).toNumber()],
        range: { min: 0, max: sliderMax.isGreaterThan(Utils.ZERO) ? sliderMax.dp(0).toNumber() : 1 }
      });

      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance.dp(0).toNumber());
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.onStakeAdjustCancelClick();
      this.collapseAllPoolTables();
    });
  }

  private subscribeToAllAssetDistPercentagesChange(): void {
    this.stateChangeService.allAssetDistPercentagesChange$.subscribe((res) => {
      this.setStakingDailyRewards();
    });
  }

  private subscribeToTokenDistributionPerDayChange(): void {
    this.stateChangeService.tokenDistributionPerDayChange$.subscribe((res) => {
      this.setStakingDailyRewards();
    });
  }

  private subscribeToOmmPriceChange(): void {
    this.stateChangeService.ommPriceChange$.subscribe((res) => {
      this.setStakingDailyRewards();
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
        this.setStakingDailyRewards();
      }
    });
  }

  /**
   * Getters, setters and checks
   */

  initStakeSlider(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    const currentUserOmmStakedBalance = this.persistenceService.getUsersStakedOmmBalance();
    const userOmmAvailableBalance = this.persistenceService.getUsersAvailableOmmBalance();
    const max = Utils.add(currentUserOmmStakedBalance, userOmmAvailableBalance).dp(0);

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

    // slider slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance.dp(0).toNumber());
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = new BigNumber(values[handle]);

      if (this.stakeDailyRewEl && this.userLoggedIn()) {
        const dailyUsersOmmStakingRewards = this.calculationService.calculateDailyUsersOmmStakingRewards(value);
        this.setText(this.stakeDailyRewEl, this.formatNumberToUSLocaleString(dailyUsersOmmStakingRewards.dp(2))
          + (dailyUsersOmmStakingRewards.isGreaterThan(Utils.ZERO) ? " OMM" : ""));
      }

      // Update Omm stake input text box
      this.inputStakeOmm.value = normalFormat.to(parseFloat(values[handle]));

      if (this.userOmmTokenBalanceDetails) {
        this.userOmmTokenBalanceDetails.stakedBalance = value;
      }
    });
  }

  getYourStakeMax(): BigNumber {
    // sliders max is sum of staked + available balance
    return Utils.add(this.persistenceService.getUsersStakedOmmBalance(),
      this.persistenceService.getUsersAvailableOmmBalance());
  }

  shouldHideClaimBtn(): boolean {
    const userOmmRewardsTotal = this.persistenceService.userOmmRewards?.total ?? new BigNumber("0");
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

  getMarketRewards(): BigNumber {
    return this.persistenceService.userOmmRewards?.reserve.total ?? new BigNumber("0");
  }

  getStakingRewards(): BigNumber {
    return this.persistenceService.userOmmRewards?.staking?.total ?? new BigNumber("0");
  }

  getLiquidityRewards(): BigNumber {
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

  getStakingApy(): BigNumber {
    return this.calculationService.calculateStakingApy();
  }

  getUserOmmStakingDailyRewards(): BigNumber {
    return this.calculationService.calculateDailyUsersOmmStakingRewards();
  }

  getDailyOmmRewards(): BigNumber {
    if (this.userLoggedIn()) {
      return this.yourDailyRewards;
    } else {
      return this.dailyOmmRewards;
    }
  }

  userHasOmmTokens(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? Utils.ZERO).isGreaterThan(Utils.ZERO);
  }

  userHasMoreThanOneOmmToken(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).isGreaterThan(new BigNumber("1"));
  }

  userHasStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance().isGreaterThan(Utils.ZERO);
  }

  isMaxStaked(): boolean {
    return new BigNumber(this.sliderStake?.noUiSlider?.options.range.max).isEqualTo(this.userOmmTokenBalanceDetails?.stakedBalance ?? -1);
  }

  isUnstaking(): boolean {
    return this.persistenceService.getUserUnstakingOmmBalance0Rounded().isGreaterThan(Utils.ZERO);
  }

  getUserOmmStakingDailyRewardsUSD(): BigNumber {
    return this.calculationService.calculateUserOmmStakingDailyRewardsUSD();
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

  getTotalStaked(): BigNumber {
    return this.persistenceService.totalStakedOmm;
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

  getDailyStakingRewards(): BigNumber {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.staking?.total ?? new BigNumber("0");
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

  setStakingDailyRewards(): void {
    this.dailyOmmRewards = this.calculationService.calculateDailyOmmStakingRewards();
    this.yourDailyRewards = this.getUserOmmStakingDailyRewards();
  }

  getUserOmmRewardsBalance(): BigNumber {
    return this.persistenceService.userOmmRewards?.total ?? new BigNumber("0");
  }

  shouldHideYourPoolsHeader(): boolean {
    return this.isAllPoolsActive() || !this.userHasStakedAnyPool();
  }
}
