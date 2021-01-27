import {Utils} from "./utils";
import {UserReserveData} from "../models/UserReserveData";
import {ReserveData} from "../models/AllReservesData";
import {UserAccountData} from "../models/UserAccountData";
import log from "loglevel";
import {ReserveConfigData} from "../models/ReserveConfigData";
import {AllReserveConfigData} from "../models/AllReserveConfigData";

export class Mapper {

  public static mapUserReserve(reserve: UserReserveData): UserReserveData {
    log.debug("mapUserReserve before: ", reserve);
    const res = new UserReserveData(
      Utils.hexToPercent(reserve.borrowRate),
      Utils.hexE18To2DecimalRoundedDown(reserve.currentBorrowBalance),
      Utils.hexE18To2DecimalRoundedDown(reserve.currentBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedDown(reserve.currentOTokenBalance),
      Utils.hexE18To2DecimalRoundedDown(reserve.currentOTokenBalanceUSD),
      Utils.hexE18ToNormalisedNumber(reserve.exchangeRate),
      Utils.hexToNumber(reserve.lastUpdateTimestamp),
      Utils.hexToPercent(reserve.liquidityRate),
      Utils.hexToNumber(reserve.originationFee),
      Utils.hexE18To2DecimalRoundedDown(reserve.principalBorrowBalance),
      Utils.hexE18To2DecimalRoundedDown(reserve.principalBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedDown(reserve.principalOTokenBalance),
      Utils.hexE18To2DecimalRoundedDown(reserve.principalOTokenBalanceUSD),
      Utils.hexToNumber(reserve.useAsCollateral),
      Utils.hexToNumber(reserve.userBorrowCumulativeIndex),
      Utils.hexToNumber(reserve.userLiquidityIndex),
    );
    log.debug("mapUserReserve after: ", res);

    return res;
  }

  public static mapUserAccountData(userAccountData: UserAccountData): UserAccountData {
    log.debug("mapUserAccountData before: ", userAccountData);
    const res = new UserAccountData(
      Utils.hexE18To2DecimalRoundedDown(userAccountData.availableBorrowsUSD),
      Utils.hexE18To2DecimalRoundedDown(userAccountData.borrowingPower),
      Utils.hexE18ToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hexE18ToNormalisedNumber(userAccountData.currentLtv),
      Utils.hexE18ToNormalisedNumber(userAccountData.healthFactor),
      Utils.hexE18ToNormalisedNumber(userAccountData.healthFactorBelowThreshold),
      Utils.hexE18To2DecimalRoundedDown(userAccountData.totalBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedDown(userAccountData.totalCollateralBalanceUSD),
      Utils.hexE18To2DecimalRoundedDown(userAccountData.totalFeesUSD),
      Utils.hexE18To2DecimalRoundedDown(userAccountData.totalLiquidityBalanceUSD),
    );
    log.debug("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    return new ReserveData(
      Utils.hexE18To2DecimalRoundedDown(reserveData.totalLiquidity),
      Utils.hexE18To2DecimalRoundedDown(reserveData.availableLiquidity),
      Utils.hexE18To2DecimalRoundedDown(reserveData.totalLiquidityUSD),
      Utils.hexE18To2DecimalRoundedDown(reserveData.availableLiquidityUSD),
      Utils.hexE18To2DecimalRoundedDown(reserveData.totalBorrows),
      Utils.hexE18To2DecimalRoundedDown(reserveData.totalBorrowsUSD),
      Utils.hexToPercent(reserveData.liquidityRate),
      Utils.hexToPercent(reserveData.borrowRate),
      reserveData.oTokenAddress,
      Utils.hexE18ToNormalisedNumber(reserveData.exchangePrice),
      Utils.hexToNumber(reserveData.lastUpdateTimestamp),
      Utils.hexE18ToNormalisedNumber(reserveData.baseLTVasCollateral),
      Utils.hexE18ToNormalisedNumber(reserveData.borrowCumulativeIndex),
      Utils.hexToNumber(reserveData.borrowingEnabled),
      Utils.hexToNumber(reserveData.decimals),
      Utils.hexToNumber(reserveData.isActive),
      Utils.hexToNumber(reserveData.isFreezed),
      Utils.hexE18ToNormalisedNumber(reserveData.liquidationBonus),
      Utils.hexE18ToNormalisedNumber(reserveData.liquidationThreshold),
      Utils.hexE18ToNormalisedNumber(reserveData.liquidityCumulativeIndex),
      reserveData.reserveAddress,
      Utils.hexToNumber(reserveData.usageAsCollateralEnabled),
    );
  }

  public static mapReserveConfigurationData(reserveConfigData: ReserveConfigData): ReserveConfigData {
    return new ReserveConfigData(
      Utils.hexE18ToNormalisedNumber(reserveConfigData.baseLTVasCollateral),
      Utils.hexToNumber(reserveConfigData.decimals),
      Utils.hexE18ToNormalisedNumber(reserveConfigData.liquidationThreshold),
      Utils.hexE18ToNormalisedNumber(reserveConfigData.liquidationBonus),
      Utils.hexToNumber(reserveConfigData.usageAsCollateralEnabled),
      Utils.hexToNumber(reserveConfigData.borrowingEnabled),
      Utils.hexToNumber(reserveConfigData.isActive)
    );
  }
}
