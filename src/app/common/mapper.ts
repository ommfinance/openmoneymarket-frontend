import {Utils} from "./utils";
import {Reserve} from "../interfaces/reserve";
import {ReserveData} from "../interfaces/all-reserves-data";
import {UserAccountData} from "../models/user-account-data";
import log from "loglevel";
import {ReserveConfigData} from "../models/ReserveConfigData";
import {AllReserveConfigData} from "../models/AllReserveConfigData";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map((key, index) => {
      // @ts-ignore
      object[key] = Utils.hex18DecimalToNormalisedNumber(object[key]);
    });
    return object;
  }

  public static mapUserReserve(reserve: Reserve): Reserve {
    log.debug("mapUserReserve before: ", reserve);
    const res = new Reserve(
      Utils.hexToPercent(reserve.borrowRate),
      Utils.hex18DecimalToNormalisedNumber(reserve.currentBorrowBalance),
      Utils.hex18DecimalToNormalisedNumber(reserve.currentBorrowBalanceUSD),
      Utils.hex18DecimalToNormalisedNumber(reserve.currentOTokenBalance),
      Utils.hex18DecimalToNormalisedNumber(reserve.currentOTokenBalanceUSD),
      Utils.hexToNumber(reserve.lastUpdateTimestamp),
      Utils.hexToPercent(reserve.liquidityRate),
      Utils.hexToNumber(reserve.originationFee),
      Utils.hex18DecimalToNormalisedNumber(reserve.principalBorrowBalance),
      Utils.hex18DecimalToNormalisedNumber(reserve.principalBorrowBalanceUSD),
      Utils.hexToNumber(reserve.useAsCollateral),
      Utils.hexToNumber(reserve.userBorrowCumulativeIndex),
    );
    log.debug("mapUserReserve after: ", res);

    return res;
  }

  public static mapUserAccountData(userAccountData: UserAccountData): UserAccountData {
    log.debug("mapUserAccountData before: ", userAccountData);
    const res = new UserAccountData(
      Utils.hex18DecimalToNormalisedNumber(userAccountData.borrowingPower),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.currentLtv),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.healthFactor),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.healthFactorBelowThreshold),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalBorrowBalanceUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalCollateralBalanceUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalFeesUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalLiquidityBalanceUSD),
    );
    log.debug("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    return new ReserveData(
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalLiquidity),
      Utils.hex18DecimalToNormalisedNumber(reserveData.availableLiquidity),
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalLiquidityUSD),
      Utils.hex18DecimalToNormalisedNumber(reserveData.availableLiquidityUSD),
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalBorrows),
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalBorrowsUSD),
      Utils.hexToPercent(reserveData.liquidityRate),
      Utils.hexToPercent(reserveData.borrowRate),
      Utils.hexToPercent(reserveData.utilizationRate),
      reserveData.oTokenAddress,
      Utils.hex18DecimalToNormalisedNumber(reserveData.exchangePrice),
      Utils.hexToNumber(reserveData.lastUpdateTimestamp),
      Utils.hex18DecimalToNormalisedNumber(reserveData.baseLTVasCollateral),
      Utils.hex18DecimalToNormalisedNumber(reserveData.borrowCumulativeIndex),
      Utils.hexToNumber(reserveData.borrowingEnabled),
      Utils.hexToNumber(reserveData.decimals),
      Utils.hexToNumber(reserveData.isActive),
      Utils.hexToNumber(reserveData.isFreezed),
      Utils.hex18DecimalToNormalisedNumber(reserveData.liquidationBonus),
      Utils.hex18DecimalToNormalisedNumber(reserveData.liquidationThreshold),
      Utils.hex18DecimalToNormalisedNumber(reserveData.utilizationRate),
      reserveData.reserveAddress,
      Utils.hexToNumber(reserveData.usageAsCollateralEnabled),
    );
  }

  public static mapReserveConfigurationData(reserveConfigData: ReserveConfigData): ReserveConfigData {
    return new ReserveConfigData(
      Utils.hex18DecimalToNormalisedNumber(reserveConfigData.baseLTVasCollateral),
      Utils.hexToNumber(reserveConfigData.decimals),
      Utils.hex18DecimalToNormalisedNumber(reserveConfigData.liquidationThreshold),
      Utils.hex18DecimalToNormalisedNumber(reserveConfigData.liquidationBonus),
      Utils.hexToNumber(reserveConfigData.usageAsCollateralEnabled),
      Utils.hexToNumber(reserveConfigData.borrowingEnabled),
      Utils.hexToNumber(reserveConfigData.isActive)
    );
  }
}
