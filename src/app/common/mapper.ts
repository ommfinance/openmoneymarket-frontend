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
      Utils.hexE18ToNormalisedNumber(reserve.borrowRate),
      Utils.hexE18To2DecimalRoundedOff(reserve.currentBorrowBalance),
      Utils.hexE18To2DecimalRoundedOff(reserve.currentBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedOff(reserve.currentOTokenBalance),
      Utils.hexE18To2DecimalRoundedOff(reserve.currentOTokenBalanceUSD),
      Utils.hexE18ToNormalisedNumber(reserve.exchangeRate),
      Utils.hexToNumber(reserve.lastUpdateTimestamp),
      Utils.hexE18ToNormalisedNumber(reserve.liquidityRate),
      Utils.hexE18ToNormalisedNumber(reserve.originationFee),
      Utils.hexE18To2DecimalRoundedOff(reserve.principalBorrowBalance),
      Utils.hexE18To2DecimalRoundedOff(reserve.principalBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedOff(reserve.principalOTokenBalance),
      Utils.hexE18To2DecimalRoundedOff(reserve.principalOTokenBalanceUSD),
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
      Utils.hexE18To2DecimalRoundedOff(userAccountData.availableBorrowsUSD),
      Utils.hexE18To2DecimalRoundedOff(userAccountData.borrowingPower),
      Utils.hexE18ToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hexE18ToNormalisedNumber(userAccountData.currentLtv),
      Utils.hexE18ToNormalisedNumber(userAccountData.healthFactor),
      Utils.hexE18ToNormalisedNumber(userAccountData.healthFactorBelowThreshold),
      Utils.hexE18To2DecimalRoundedOff(userAccountData.totalBorrowBalanceUSD),
      Utils.hexE18To2DecimalRoundedOff(userAccountData.totalCollateralBalanceUSD),
      Utils.hexE18To2DecimalRoundedOff(userAccountData.totalFeesUSD),
      Utils.hexE18To2DecimalRoundedOff(userAccountData.totalLiquidityBalanceUSD),
    );
    log.debug("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    return new ReserveData(
      Utils.hexE18To2DecimalRoundedOff(reserveData.totalLiquidity),
      Utils.hexE18To2DecimalRoundedOff(reserveData.availableLiquidity),
      Utils.hexE18To2DecimalRoundedOff(reserveData.totalLiquidityUSD),
      Utils.hexE18To2DecimalRoundedOff(reserveData.availableLiquidityUSD),
      Utils.hexE18To2DecimalRoundedOff(reserveData.totalBorrows),
      Utils.hexE18To2DecimalRoundedOff(reserveData.totalBorrowsUSD),
      Utils.hexE18ToNormalisedNumber(reserveData.liquidityRate),
      Utils.hexE18ToNormalisedNumber(reserveData.borrowRate),
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
      Utils.hexE18ToNormalisedNumber(reserveData.sICXRate),
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
