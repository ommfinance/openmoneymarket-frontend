import {Utils} from "./utils";
import {Reserve} from "../interfaces/reserve";
import {ReserveData} from "../interfaces/all-reserves";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map((key, index) => {
      // @ts-ignore
      object[key] = Utils.hex18DecimalToNormalisedNumber(object[key]);
    });
    return object;
  }

  public static mapUserUSDbReserve(userUSDbReserve: Reserve): Reserve {
    console.log("mapUserUSDbReserve before: ", userUSDbReserve);
    const res = new Reserve(
      Utils.hexToPercent(userUSDbReserve.borrowRate),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.currentBorrowBalance),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.currentBorrowBalanceUSD),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.currentOTokenBalance),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.currentOTokenBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.lastUpdateTimestamp),
      Utils.hexToPercent(userUSDbReserve.liquidityRate),
      Utils.hexToNumber(userUSDbReserve.originationFee),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.principalBorrowBalance),
      Utils.hex18DecimalToNormalisedNumber(userUSDbReserve.principalBorrowBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.useAsCollateral),
      Utils.hexToNumber(userUSDbReserve.userBorrowCumulativeIndex),
    );
    console.log("mapUserUSDbReserve after: ", res);

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
