import {Utils} from "./utils";
import {UserReserveData} from "../models/UserReserveData";
import {ReserveData} from "../models/AllReservesData";
import {UserAccountData} from "../models/UserAccountData";
import log from "loglevel";
import {ReserveConfigData} from "../models/ReserveConfigData";
import {Liquidity, OmmRewards, Reserve, Staking} from "../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../models/OmmTokenBalanceDetails";
import {Prep, PrepList} from "../models/Preps";
import {DelegationPreference} from "../models/DelegationPreference";
import {YourPrepVote} from "../models/YourPrepVote";
import {UnstakeIcxData, UnstakeInfo} from "../models/UnstakeInfo";
import {DistributionPercentages} from "../models/DistributionPercentages";
import {PoolStats, PoolStatsInterface} from "../models/PoolStats";
import {TotalPoolInterface, UserPoolDataInterface} from "../models/Poolnterfaces";
import {UserPoolData} from "../models/UserPoolData";
import {AllAssetDistPercentages, LiquidityAllAsset, ReserveAllAsset, StakingAllAsset} from "../models/AllAssetDisPercentages";
import {
  DailyRewardsAllReservesPools,
  LiquidityDailyRewards,
  ReserveDailyRewards,
  StakingDailyRewards
} from "../models/DailyRewardsAllReservesPools";

export class Mapper {


  public static mapDistributionPercentages(distributionPercentages: DistributionPercentages): DistributionPercentages {
    return new DistributionPercentages(
      Utils.hexToNormalisedNumber(distributionPercentages.daoFund),
      Utils.hexToNormalisedNumber(distributionPercentages.liquidityProvider),
      Utils.hexToNormalisedNumber(distributionPercentages.lendingBorrow),
      Utils.hexToNormalisedNumber(distributionPercentages.worker)
    );
  }

  public static mapUserReserve(reserve: UserReserveData, decimals: number = 18): UserReserveData {
    log.debug("mapUserReserve before: ", reserve);
    const res = new UserReserveData(
      Utils.hexToNormalisedNumber(reserve.borrowRate),
      Utils.hexToNormalisedNumber(reserve.currentBorrowBalance, decimals),
      Utils.hexToNormalisedNumber(reserve.currentBorrowBalanceUSD),
      Utils.hexToNormalisedNumber(reserve.currentOTokenBalance, decimals),
      Utils.hexToNormalisedNumber(reserve.currentOTokenBalanceUSD),
      Utils.hexToNormalisedNumber(reserve.exchangeRate),
      Utils.hexToNumber(reserve.lastUpdateTimestamp),
      Utils.hexToNormalisedNumber(reserve.liquidityRate),
      Utils.hexToNormalisedNumber(reserve.originationFee, decimals),
      Utils.hexToNormalisedNumber(reserve.principalBorrowBalance, decimals),
      Utils.hexToNormalisedNumber(reserve.principalBorrowBalanceUSD),
      Utils.hexToNormalisedNumber(reserve.principalOTokenBalance, decimals),
      Utils.hexToNormalisedNumber(reserve.principalOTokenBalanceUSD),
      Utils.hexToNumber(reserve.useAsCollateral),
      Utils.hexToNumber(reserve.userBorrowCumulativeIndex),
      Utils.hexToNumber(reserve.userLiquidityIndex),
    );
    log.debug("mapUserReserve after: ", res);

    return res;
  }

  public static mapUserOmmRewards(ommRewards: OmmRewards): OmmRewards {
    log.debug("mapUserOmmRewards before: ", ommRewards);
    const res = new OmmRewards(
      new Liquidity(
        Utils.hexToNormalisedNumber(ommRewards.liquidity["OMM/SICX"]),
        Utils.hexToNormalisedNumber(ommRewards.liquidity["OMM/USDS"]),
        Utils.hexToNormalisedNumber(ommRewards.liquidity["OMM/IUSDC"]),
        Utils.hexToNormalisedNumber(ommRewards.liquidity.total)
      ),
      new Staking(
        Utils.hexToNormalisedNumber(ommRewards.staking.OMM),
        Utils.hexToNormalisedNumber(ommRewards.staking.total)
      ),
      new Reserve(
        Utils.hexToNormalisedNumber(ommRewards.reserve.oUSDS),
        Utils.hexToNormalisedNumber(ommRewards.reserve.dUSDS),
        Utils.hexToNormalisedNumber(ommRewards.reserve.dICX),
        Utils.hexToNormalisedNumber(ommRewards.reserve.oICX),
        Utils.hexToNormalisedNumber(ommRewards.reserve.oIUSDC),
        Utils.hexToNormalisedNumber(ommRewards.reserve.dIUSDC),
        Utils.hexToNormalisedNumber(ommRewards.reserve.total)
      ),
      Utils.hexToNormalisedNumber(ommRewards.total)
    );
    log.debug("mapUserOmmRewards after: ", res);

    return res;
  }

  public static mapAllAssetDistPercentages(value: AllAssetDistPercentages): AllAssetDistPercentages {
    log.debug("mapAllAssetDistPercentages value: ", value);
    const res = new AllAssetDistPercentages(
      new LiquidityAllAsset(
        Utils.hexToNormalisedNumber(value.liquidity["OMM/SICX"]),
        Utils.hexToNormalisedNumber(value.liquidity["OMM/USDS"]),
        Utils.hexToNormalisedNumber(value.liquidity["OMM/IUSDC"]),
        Utils.hexToNormalisedNumber(value.liquidity.total),
      ),
      new StakingAllAsset(
        Utils.hexToNormalisedNumber(value.staking.OMM),
        Utils.hexToNormalisedNumber(value.staking.total)
      ),
      new ReserveAllAsset(
        Utils.hexToNormalisedNumber(value.reserve.oUSDS),
        Utils.hexToNormalisedNumber(value.reserve.dUSDS),
        Utils.hexToNormalisedNumber(value.reserve.dICX),
        Utils.hexToNormalisedNumber(value.reserve.oICX),
        Utils.hexToNormalisedNumber(value.reserve.oIUSDC),
        Utils.hexToNormalisedNumber(value.reserve.dIUSDC),
        Utils.hexToNormalisedNumber(value.reserve.total)
      ),
      Utils.hexToNormalisedNumber(value.total));
    log.debug("mapAllAssetDistPercentages after: ", res);

    return res;
  }

  public static mapDailyRewardsAllReservesPools(value: DailyRewardsAllReservesPools): DailyRewardsAllReservesPools {
    log.debug("mapDailyRewardsAllReservesPools value: ", value);
    const res = new DailyRewardsAllReservesPools(
      new LiquidityDailyRewards(
        Utils.hexToNormalisedNumber(value.liquidity["OMM/SICX"]),
        Utils.hexToNormalisedNumber(value.liquidity["OMM/USDS"]),
        Utils.hexToNormalisedNumber(value.liquidity["OMM/IUSDC"]),
        Utils.hexToNormalisedNumber(value.liquidity.total),
      ),
      new StakingDailyRewards(
        Utils.hexToNormalisedNumber(value.staking.OMM),
        Utils.hexToNormalisedNumber(value.staking.total)
      ),
      new ReserveDailyRewards(
        Utils.hexToNormalisedNumber(value.reserve.oUSDS),
        Utils.hexToNormalisedNumber(value.reserve.dUSDS),
        Utils.hexToNormalisedNumber(value.reserve.dICX),
        Utils.hexToNormalisedNumber(value.reserve.oICX),
        Utils.hexToNormalisedNumber(value.reserve.oIUSDC),
        Utils.hexToNormalisedNumber(value.reserve.dIUSDC),
        Utils.hexToNormalisedNumber(value.reserve.total)
      ),
      Utils.hexToNormalisedNumber(value.total),
      Utils.hexToNumber(value.day));
    log.debug("mapDailyRewardsAllReservesPools after: ", res);

    return res;
  }

  public static mapUserOmmTokenBalanceDetails(ommTokenBalanceDetails: OmmTokenBalanceDetails): OmmTokenBalanceDetails {
    log.debug("mapUserOmmTokenBalanceDetails before: ", ommTokenBalanceDetails);
    const res = new OmmTokenBalanceDetails(
      Utils.hexToNormalisedNumber(ommTokenBalanceDetails.totalBalance),
      Utils.hexToNormalisedNumber(ommTokenBalanceDetails.availableBalance),
      Utils.hexToNormalisedNumber(ommTokenBalanceDetails.stakedBalance),
      Utils.hexToNormalisedNumber(ommTokenBalanceDetails.unstakingBalance),
      Utils.hexToNumber(ommTokenBalanceDetails.unstakingTimeInMills)
    );
    log.debug("mapUserOmmTokenBalanceDetails after: ", res);

    return res;
  }

  public static mapUserAccountData(userAccountData: UserAccountData): UserAccountData {
    log.debug("mapUserAccountData before: ", userAccountData);
    const res = new UserAccountData(
      Utils.hexToNormalisedNumber(userAccountData.availableBorrowsUSD),
      Utils.hexToNormalisedNumber(userAccountData.borrowingPower),
      Utils.hexToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hexToNormalisedNumber(userAccountData.currentLtv),
      Utils.hexToNormalisedNumber(userAccountData.healthFactor),
      Utils.hexToNormalisedNumber(userAccountData.healthFactorBelowThreshold),
      Utils.hexToNormalisedNumber(userAccountData.totalBorrowBalanceUSD),
      Utils.hexToNormalisedNumber(userAccountData.totalCollateralBalanceUSD),
      Utils.hexToNormalisedNumber(userAccountData.totalFeesUSD),
      Utils.hexToNormalisedNumber(userAccountData.totalLiquidityBalanceUSD),
    );
    log.debug("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    const decimals = Utils.hexToNumber(reserveData.decimals);

    return new ReserveData(
      Utils.hexToNormalisedNumber(reserveData.totalLiquidity, decimals),
      Utils.hexToNormalisedNumber(reserveData.availableLiquidity, decimals),
      Utils.hexToNormalisedNumber(reserveData.totalLiquidityUSD),
      Utils.hexToNormalisedNumber(reserveData.availableLiquidityUSD),
      Utils.hexToNormalisedNumber(reserveData.totalBorrows, decimals),
      Utils.hexToNormalisedNumber(reserveData.totalBorrowsUSD),
      Utils.hexToNormalisedNumber(reserveData.liquidityRate),
      Utils.hexToNormalisedNumber(reserveData.borrowRate),
      reserveData.oTokenAddress,
      Utils.hexToNormalisedNumber(reserveData.exchangePrice),
      Utils.hexToNumber(reserveData.lastUpdateTimestamp),
      Utils.hexToNormalisedNumber(reserveData.baseLTVasCollateral),
      Utils.hexToNormalisedNumber(reserveData.borrowCumulativeIndex),
      Utils.hexToNumber(reserveData.borrowingEnabled),
      Utils.hexToNumber(reserveData.decimals),
      Utils.hexToNumber(reserveData.isActive),
      Utils.hexToNumber(reserveData.isFreezed),
      Utils.hexToNormalisedNumber(reserveData.liquidationBonus),
      Utils.hexToNormalisedNumber(reserveData.liquidationThreshold),
      Utils.hexToNormalisedNumber(reserveData.liquidityCumulativeIndex),
      reserveData.reserveAddress,
      Utils.hexToNormalisedNumber(reserveData.sICXRate),
      Utils.hexToNumber(reserveData.usageAsCollateralEnabled),
      Utils.hexToNormalisedNumber(reserveData.rewardPercentage),
      Utils.hexToNormalisedNumber(reserveData.lendingPercentage),
      Utils.hexToNormalisedNumber(reserveData.borrowingPercentage),
    );
  }

  public static mapReserveConfigurationData(reserveConfigData: ReserveConfigData): ReserveConfigData {
    return new ReserveConfigData(
      Utils.hexToNormalisedNumber(reserveConfigData.baseLTVasCollateral),
      Utils.hexToNumber(reserveConfigData.decimals),
      Utils.hexToNormalisedNumber(reserveConfigData.liquidationThreshold),
      Utils.hexToNormalisedNumber(reserveConfigData.liquidationBonus),
      Utils.hexToNumber(reserveConfigData.usageAsCollateralEnabled),
      Utils.hexToNumber(reserveConfigData.borrowingEnabled),
      Utils.hexToNumber(reserveConfigData.isActive)
    );
  }

  public static mapPrepList(prepList: PrepList): PrepList {
    log.debug("prepList before: ", prepList);

    const preps: Prep[] = [];

    prepList.preps.forEach(prep => {
      preps.push(new Prep(
        prep.address,
        prep.name,
        Utils.hexToNormalisedNumber(prep.stake),
        Utils.hexToNormalisedNumber(prep.delegated),
        Utils.hexToNormalisedNumber(prep.irep),
        prep.details
      ));
    });

    const res = new PrepList(
      Utils.hexToNormalisedNumber(prepList.totalDelegated),
      Utils.hexToNormalisedNumber(prepList.totalStake),
      preps
    );

    log.debug("prepList after: ", res);

    return res;
  }

  public static mapPrep(prep: Prep): Prep {
    return new Prep(
      prep.address,
      prep.name,
      Utils.hexToNormalisedNumber(prep.stake),
      Utils.hexToNormalisedNumber(prep.delegated),
      Utils.hexToNormalisedNumber(prep.irep),
      prep.details
    );
  }

  public static mapUserDelegations(delegations: DelegationPreference[], prepAddressToNameMap?: Map<string, string>): YourPrepVote[] {
    const res: YourPrepVote[] = [];

    delegations.forEach(delegation => {
      res.push(new YourPrepVote(
        delegation._address,
        prepAddressToNameMap?.get(delegation._address) ?? "Unknown",
        Utils.multiplyDecimalsPrecision(Utils.hexToNormalisedNumber(delegation._votes_in_per), 100)));
    });

    return res;
  }

  public static mapPoolStats(poolStats: PoolStatsInterface): PoolStats {
    const baseDecimals = Utils.hexToNumber(poolStats.base_decimals);
    const quoteDecimals = Utils.hexToNumber(poolStats.quote_decimals);

    return new PoolStats(
      Utils.hexToNormalisedNumber(poolStats.base, baseDecimals),
      Utils.hexToNormalisedNumber(poolStats.quote, quoteDecimals),
      poolStats.base_token,
      poolStats.quote_token,
      Utils.hexToNormalisedNumber(poolStats.total_supply, PoolStats.getPoolPrecision(baseDecimals, quoteDecimals)),
      Utils.hexToNormalisedNumber(poolStats.price, quoteDecimals),
      poolStats.name,
      baseDecimals,
      quoteDecimals,
      Utils.hexToNumber(poolStats.min_quote)
    );
  }

  public static mapUserIcxUnstakeData(unstakeIcxData: UnstakeIcxData[]): UnstakeInfo {
    let totalAmount = 0;
    unstakeIcxData.forEach(u => totalAmount += Utils.hexToNormalisedNumber(u.amount));
    return new UnstakeInfo(totalAmount, unstakeIcxData);
  }

  public static mapPoolsData(poolsData: TotalPoolInterface[]): TotalPoolInterface[] {
    return poolsData.map(data => {
      return {
        poolID: Utils.hexToNumber(data.poolID),
        totalStakedBalance: data.totalStakedBalance // map this after pool stats is received and precision derived
      };
    });
  }

  public static mapUserPoolData(poolsData: UserPoolDataInterface, decimals: number, poolStats: PoolStats): UserPoolData {
    return new UserPoolData(
      Utils.hexToNumber(poolsData.poolID),
      Utils.hexToNormalisedNumber(poolsData.totalStakedBalance, decimals),
      Utils.hexToNormalisedNumber(poolsData.userAvailableBalance, decimals),
      Utils.hexToNormalisedNumber(poolsData.userStakedBalance, decimals),
      Utils.hexToNormalisedNumber(poolsData.userTotalBalance, decimals),
      poolStats
  );
  }
}
