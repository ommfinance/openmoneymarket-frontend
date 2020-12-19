import {Utils} from "./utils";
import {Reserve} from "../interfaces/reserve";
import {ReserveData} from "../interfaces/all-reserves";
import {UserAccountData} from "../models/user-account-data";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map((key, index) => {
      // @ts-ignore
      object[key] = Utils.hex18DecimalToNormalisedNumber(object[key]);
    });
    return object;
  }

  public static mapUserReserve(reserve: Reserve): Reserve {
    console.log("mapUserReserve before: ", reserve);
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
    console.log("mapUserReserve after: ", res);

    return res;
  }

  public static mapUserAccountData(userAccountData: UserAccountData): UserAccountData {
    console.log("mapUserAccountData before: ", userAccountData);
    const res = new UserAccountData(
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalLiquidityICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalCollateralICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalBorrowsICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalFeesICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.availableBorrowsICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.collateralInterestICX),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalLiquidityUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalCollateralUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalBorrowsUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.totalFeesUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.availableBorrowsUSD),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.collateralInterestUSD),
      Utils.hexToPercent(userAccountData.liquidityRate),
      Utils.hexToPercent(userAccountData.borrowRate),
      Utils.hex18DecimalToNormalisedNumber(userAccountData.currentLiquidationThreshold),
      Utils.hexToNumber(userAccountData.ltv),
      Utils.hexToNumber(userAccountData.healthFactor),
    );
    console.log("mapUserAccountData after: ", res);
    return res;
  }

  public static mapReserveData(reserveData: ReserveData): ReserveData {
    return new ReserveData(
      Utils.hex18DecimalToNormalisedNumber(reserveData.availableLiquidity),
      Utils.hexToNumber(reserveData.baseLTVasCollateral),
      Utils.hex18DecimalToNormalisedNumber(reserveData.borrowCumulativeIndex),
      Utils.hexToPercent(reserveData.borrowRate),
      Utils.hexToNumber(reserveData.borrowingEnabled),
      Utils.hexToNumber(reserveData.decimals),
      Utils.hexToNumber(reserveData.isActive),
      Utils.hexToNumber(reserveData.isFreezed),
      Utils.hexToNumber(reserveData.lastUpdateTimestamp),
      Utils.hexToNumber(reserveData.liquidationBonus),
      Utils.hexToNumber(reserveData.liquidationThreshold),
      Utils.hexToNumber(reserveData.liquidityCumulativeIndex),
      Utils.hexToPercent(reserveData.liquidityRate),
      reserveData.oTokenAddress,
      reserveData.reserveAddress,
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalBorrows),
      Utils.hex18DecimalToNormalisedNumber(reserveData.totalLiquidity),
      Utils.hexToNumber(reserveData.usageAsCollateralEnabled)
    );
  }
}
