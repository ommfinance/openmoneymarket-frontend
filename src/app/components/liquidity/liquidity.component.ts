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

declare var $: any;
declare var noUiSlider: any;

@Component({
  selector: 'app-liquidity',
  templateUrl: './liquidity.component.html',
  styleUrls: ['./liquidity.component.css']
})
export class LiquidityComponent extends BaseClass implements OnInit, AfterViewInit {

  toggleYourPoolsEl: any; @ViewChild("toggYourPools")set a(a: ElementRef) {this.toggleYourPoolsEl = a.nativeElement; }
  toggleAllPoolsEl: any; @ViewChild("toggAllPools") set b(b: ElementRef) {this.toggleAllPoolsEl = b.nativeElement; }
  private ommStakeAmount?: any; @ViewChild("ommStk")set c(ommStake: ElementRef) {this.ommStakeAmount = ommStake.nativeElement; }
  private sliderStake!: any; @ViewChild("stkSlider")set d(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  stakeDailyRewEl: any; @ViewChild("stkDailyRew")set e(a: ElementRef) {this.stakeDailyRewEl = a.nativeElement; }

  public activeLiquidityOverview: ActiveLiquidityOverview = this.userLoggedIn() ? ActiveLiquidityOverview.YOUR_LIQUIDITY :
    ActiveLiquidityOverview.ALL_LIQUIDITY;
  public activeLiquidityPoolView: ActiveLiquidityPoolsView = ActiveLiquidityPoolsView.ALL_POOLS;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  stakeAdjustActive = false;

  constructor(public persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private modalService: ModalService,
              private calculationService: CalculationsService,
              private notificationService: NotificationService,
              private cd: ChangeDetectorRef) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initStakeSlider();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  /**
   * Click event handlers
   */

  onClaimOmmRewardsClick(): void {
    this.onStakeAdjustCancelClick();
    this.stakeAdjustActive = false;

    const rewards = this.roundDownTo2Decimals(this.persistenceService.userOmmRewards?.total ?? 0);

    if (rewards <= 0) {
      return;
    }

    const before = this.roundDownTo2Decimals(this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0);
    const after = Utils.addDecimalsPrecision(before, rewards);
    this.modalService.showNewModal(ModalType.CLAIM_OMM_REWARDS, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS),
      before, after, rewards, undefined, new ClaimOmmDetails(this.persistenceService.userOmmRewards)));
  }

  onConfirmStakeClick(): void {
    log.debug(`onConfirmStakeClick Omm stake amount = ${this.userOmmTokenBalanceDetails?.stakedBalance}`);
    const before = this.roundDownToZeroDecimals(this.persistenceService.getUsersStakedOmmBalance());
    log.debug("before = ", before);
    const after = this.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails?.stakedBalance ?? 0);
    log.debug("after = ", after);
    const diff = Utils.subtractDecimalsWithPrecision(after, before, 0);
    log.debug("Diff = ", diff);

    // if before and after equal show notification
    if (before === after) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const voteAction = new StakingAction(before, after, Math.abs(diff));

    if (diff > 0) {
      if (this.persistenceService.minOmmStakeAmount > diff) {
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

    $(".stake-omm-actions-adjust").removeClass('hide');
    $(".stake-omm-actions-default").addClass('hide');
    this.sliderStake.removeAttribute("disabled");
  }

  // On "Cancel Stake" click
  onStakeAdjustCancelClick(): void {
    this.stakeAdjustActive = false;

    $(".stake-omm-actions-adjust").addClass('hide');
    $(".stake-omm-actions-default").removeClass('hide');

    // Set your stake slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.getUsersStakedOmmBalance());
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

  onPoolClick(poolData: UserPoolData | PoolData): void {
    this.stakeAdjustActive = false;
    this.onStakeAdjustCancelClick();

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
    this.subscribeToOmmTokenBalanceChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToAllAssetDistPercentagesChange();
    this.subscribeToOmmPriceChange();
  }

  private subscribeToOmmTokenBalanceChange(): void {
    this.stateChangeService.userOmmTokenBalanceDetailsChange.subscribe((res: OmmTokenBalanceDetails) => {
      this.userOmmTokenBalanceDetails = res.getClone();

      // sliders max is sum of staked + available balance
      const sliderMax = Utils.addDecimalsPrecision(this.persistenceService.getUsersStakedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.userOmmTokenBalanceDetails.stakedBalance],
        range: { min: 0, max: sliderMax > 0 ? sliderMax : 1 }
      });

      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance);
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
    const max = Utils.addDecimalsPrecision(currentUserOmmStakedBalance, userOmmAvailableBalance);

    // create Stake slider
    if (this.sliderStake) {
      noUiSlider.create(this.sliderStake, {
        start: 0,
        padding: 0,
        connect: 'lower',
        range: {
          min: [0],
          max: [max === 0 ? 1 : max]
        },
        step: 1,
      });
    }

    // slider slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails.stakedBalance));
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];

      if (this.stakeDailyRewEl) {
        this.setText(this.stakeDailyRewEl, this.toDollarUSLocaleString(this.roundDownTo2Decimals(
          this.calculationService.calculateDailyUsersOmmStakingRewards(value)))  + " OMM");
      }

      if (this.userOmmTokenBalanceDetails) {
        this.userOmmTokenBalanceDetails.stakedBalance = value;
      }
    });
  }

  getYourStakeMax(): number {
    // sliders max is sum of staked + available balance
    return Utils.addDecimalsPrecision(this.persistenceService.getUsersStakedOmmBalance(),
      this.persistenceService.getUsersAvailableOmmBalance());
  }

  shouldHideClaimBtn(): boolean {
    const userOmmRewardsTotal = this.persistenceService.userOmmRewards?.total ?? 0;
    return userOmmRewardsTotal <= 0 || this.persistenceService.userOmmTokenBalanceDetails == null;
  }

  getMarketRewards(): number {
    return this.persistenceService.userOmmRewards?.reserve.total ?? 0;
  }

  getStakingRewards(): number {
    return this.persistenceService.userOmmRewards?.staking.total ?? 0;
  }

  getLiquidityRewards(): number {
    return this.persistenceService.userOmmRewards?.liquidity.total ?? 0;
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

  getStakingApy(): number {
    return this.calculationService.calculateStakingApy();
  }

  getUserOmmStakingDailyRewards(): number {
    return this.calculationService.calculateDailyUsersOmmStakingRewards();
  }

  getDailyOmmRewards(): number {
    if (this.userLoggedIn()) {
      return this.getUserOmmStakingDailyRewards();
    } else {
      return this.calculationService.calculateDailyOmmStakingRewards();
    }
  }

  userHasOmmTokens(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0) > 0;
  }

  userHasStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance() > 0;
  }

  isMaxStaked(): boolean {
    return this.sliderStake?.noUiSlider?.options.range.max === this.userOmmTokenBalanceDetails?.stakedBalance;
  }

  isUnstaking(): boolean {
    return this.persistenceService.getUserUnstakingOmmBalance() > 0;
  }

  getUserOmmStakingDailyRewardsUSD(): number {
    return this.calculationService.calculateUserOmmStakingDailyRewardsUSD();
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

  getTotalStaked(): number {
    return this.persistenceService.totalStakedOmm;
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

  getTotalDailyRewards(): number {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.total ?? 0;
  }

  getDailyMarketRewards(): number {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.total ?? 0;
  }

  getDailyStakingRewards(): number {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.staking.total ?? 0;
  }

  getDailyLiquidityRewards(): number {
    return this.persistenceService.dailyRewardsAllPoolsReserves?.liquidity.total ?? 0;
  }

  getDailyRewardsUSD(poolData: PoolData): number {
    return this.calculationService.calculateDailyRewardsForPool(poolData) * this.persistenceService.ommPriceUSD;
  }

  getLiquidityApy(poolData: PoolData): number {
    return this.calculationService.calculatePoolLiquidityApy(poolData);
  }

  isAllPoolsActive(): boolean {
    return this.activeLiquidityPoolView === ActiveLiquidityPoolsView.ALL_POOLS;
  }

  isAllLiquidityOverviewActive(): boolean {
    return this.activeLiquidityOverview === ActiveLiquidityOverview.ALL_LIQUIDITY;
  }

  setStakingDailyRewards(): void {
    this.setText(this.stakeDailyRewEl, this.toDollarUSLocaleString(this.roundDownTo2Decimals(
      this.getDailyOmmRewards()))  + " OMM");
  }

  getUserOmmRewardsBalance(): number {
    return this.persistenceService.userOmmRewards?.total ?? 0;
  }

}
