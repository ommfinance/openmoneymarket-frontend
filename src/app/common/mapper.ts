import {Utils} from "./utils";
import {UserReserveData} from "../models/UserReserveData";
import {ReserveData} from "../models/AllReservesData";
import {UserAccountData} from "../models/UserAccountData";
import log from "loglevel";
import {ReserveConfigData} from "../models/ReserveConfigData";
import {OmmRewards} from "../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../models/OmmTokenBalanceDetails";

export class Mapper {

  public static mapUserReserve(reserve: UserReserveData, decimals: number = 18): UserReserveData {
    log.debug("mapUserReserve before: ", reserve);
    const res = new UserReserveData(
      Utils.hexToNormalisedNumber(reserve.borrowRate),
      Utils.hexTo2DecimalRoundedOff(reserve.currentBorrowBalance, decimals),
      Utils.hexTo2DecimalRoundedOff(reserve.currentBorrowBalanceUSD),
      Utils.hexTo2DecimalRoundedOff(reserve.currentOTokenBalance, decimals),
      Utils.hexTo2DecimalRoundedOff(reserve.currentOTokenBalanceUSD),
      Utils.hexToNormalisedNumber(reserve.exchangeRate),
      Utils.hexToNumber(reserve.lastUpdateTimestamp),
      Utils.hexToNormalisedNumber(reserve.liquidityRate),
      Utils.hexToNormalisedNumber(reserve.originationFee, decimals),
      Utils.hexTo2DecimalRoundedOff(reserve.principalBorrowBalance, decimals),
      Utils.hexTo2DecimalRoundedOff(reserve.principalBorrowBalanceUSD),
      Utils.hexTo2DecimalRoundedOff(reserve.principalOTokenBalance, decimals),
      Utils.hexTo2DecimalRoundedOff(reserve.principalOTokenBalanceUSD),
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
      Utils.hexTo2DecimalRoundedOff(ommRewards.deposit),
      Utils.hexTo2DecimalRoundedOff(ommRewards.borrow),
      Utils.hexTo2DecimalRoundedOff(ommRewards.ommICX),
      Utils.hexTo2DecimalRoundedOff(ommRewards.ommUSDb),
      Utils.hexTo2DecimalRoundedOff(ommRewards.worker),
      Utils.hexTo2DecimalRoundedOff(ommRewards.daoFund),
      Utils.hexTo2DecimalRoundedOff(ommRewards.total)
    );
    log.debug("mapUserOmmRewards after: ", res);

    return res;
  }

  public static mapUserOmmTokenBalanceDetails(ommTokenBalanceDetails: OmmTokenBalanceDetails): OmmTokenBalanceDetails {
    log.debug("mapUserOmmTokenBalanceDetails before: ", ommTokenBalanceDetails);
    const res = new OmmTokenBalanceDetails(
      Utils.hexTo2DecimalRoundedOff(ommTokenBalanceDetails.totalBalance),
      Utils.hexTo2DecimalRoundedOff(ommTokenBalanceDetails.availableBalance),
      Utils.hexTo2DecimalRoundedOff(ommTokenBalanceDetails.stakedBalance),
      Utils.hexTo2DecimalRoundedOff(ommTokenBalanceDetails.unstakingBalance),
      Utils.hexToNumber(ommTokenBalanceDetails.unstakingTimeInMills)
    );
    log.debug("mapUserOmmTokenBalanceDetails after: ", res);

    return res;
  }

  public static mapUserAccountData(userAccountData: UserAccountData): UserAccountData {
    log.debug("mapUserAccountData before: ", userAccountData);
    const res = new UserAccountData(
      Utils.hexTo2DecimalRoundedOff(userAccountData.availableBorrowsUSD),
      Utils.hexTo2DecimalRoundedOff(userAccountData.borrowingPower),
      Utils.hexToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hexToNormalisedNumber(userAccountData.currentLtv),
      Utils.hexToNormalisedNumber(userAccountData.healthFactor),
      Utils.hexToNormalisedNumber(userAccountData.healthFactorBelowThreshold),
      Utils.hexTo2DecimalRoundedOff(userAccountData.totalBorrowBalanceUSD),
      Utils.hexTo2DecimalRoundedOff(userAccountData.totalCollateralBalanceUSD),
      Utils.hexTo2DecimalRoundedOff(userAccountData.totalFeesUSD),
      Utils.hexTo2DecimalRoundedOff(userAccountData.totalLiquidityBalanceUSD),
    );
    log.debug("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    const decimals = Utils.hexToNumber(reserveData.decimals);

    return new ReserveData(
      Utils.hexTo2DecimalRoundedOff(reserveData.totalLiquidity, decimals),
      Utils.hexTo2DecimalRoundedOff(reserveData.availableLiquidity, decimals),
      Utils.hexTo2DecimalRoundedOff(reserveData.totalLiquidityUSD),
      Utils.hexTo2DecimalRoundedOff(reserveData.availableLiquidityUSD),
      Utils.hexTo2DecimalRoundedOff(reserveData.totalBorrows, decimals),
      Utils.hexTo2DecimalRoundedOff(reserveData.totalBorrowsUSD),
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
}
