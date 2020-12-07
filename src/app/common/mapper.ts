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
