import {Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ActiveLiquidityPoolsView} from "../../models/enums/ActiveViews";
import {Utils} from "../../common/utils";
import {UserPoolData} from "../../models/classes/UserPoolData";
import BigNumber from "bignumber.js";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {PoolData} from "../../models/classes/PoolData";
import {YourPoolRowComponent} from "./your-pool-row/your-pool-row.component";

declare var $: any;

@Component({
  selector: 'app-your-pools',
  templateUrl: './your-pools.component.html'
})
export class YourPoolsComponent extends BaseClass implements OnInit {

  // Asset children components
  @ViewChildren('pool') yourPoolRowComponents!: QueryList<YourPoolRowComponent>;

  @Input() activeLiquidityPoolView!: ActiveLiquidityPoolsView;

  @Output() poolClickUpdate = new EventEmitter<PoolData>();

  constructor(private stateChangeService: StateChangeService,
              private calculationService: CalculationsService,
              public persistenceService: PersistenceService) {
    super(persistenceService);
  }

  ngOnInit(): void {
  }

  onPoolClick(poolData: PoolData): void {
    this.poolClickUpdate.emit(poolData);

    // commit event to state change
    this.stateChangeService.poolClickCUpdate(poolData);
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

  userHasStakedToPool(poolData: UserPoolData): boolean {
    return poolData.userStakedBalance.isGreaterThan(Utils.ZERO);
  }

  userHasLpTokenAvailableOrHasStaked(poolId: BigNumber): boolean {
    return this.persistenceService.getUserPoolStakedAvailableBalance(poolId).isGreaterThan(Utils.ZERO)
      || this.persistenceService.getUserPoolStakedBalance(poolId).isGreaterThan(Utils.ZERO);
  }

  userHasAvailableStakeToPool(poolData: UserPoolData): boolean {
    return poolData.userAvailableBalance.isGreaterThan(Utils.ZERO);
  }

  getUserPoolsAvailableData(): UserPoolData[] {
    return this.persistenceService.userPools?.filter(pool => pool.userAvailableBalance.isGreaterThan(Utils.ZERO)
      && pool.userStakedBalance.isZero());
  }

  shouldHideYourPoolsHeader(): boolean {
    return this.isAllPoolsActive() || !this.userHasStakedAnyPool();
  }

  getUserDailyRewards(poolData: UserPoolData): BigNumber {
    const userDailyOmmRewards: any = this.persistenceService.userDailyOmmRewards;
    if (userDailyOmmRewards) {
      return userDailyOmmRewards[poolData.getCleanPoolName()] ?? new BigNumber(0);
    } else {
      return new BigNumber(0);
    }
  }

  getUserSuppliedQuote(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolSupplied(poolData, false);
  }

  getUserPoolLiquidityApr(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolLiquidityApr(poolData);
  }

  getUserDailyRewardsUSD(poolData: UserPoolData): BigNumber {
    return this.getUserDailyRewards(poolData).multipliedBy(this.persistenceService.ommPriceUSD);
  }

  getUserSuppliedBase(poolData: UserPoolData): BigNumber {
    return this.calculationService.calculateUserPoolSupplied(poolData);
  }

  getUserStakedPoolsData(): UserPoolData[] {
    return this.persistenceService.userPools?.filter(pool => pool.userStakedBalance.isGreaterThan(Utils.ZERO));
  }

  getUserPoolsData(): UserPoolData[] {
    return this.persistenceService.userPools ?? [];
  }

  isAllPoolsActive(): boolean {
    return this.activeLiquidityPoolView === ActiveLiquidityPoolsView.ALL_POOLS;
  }

}
