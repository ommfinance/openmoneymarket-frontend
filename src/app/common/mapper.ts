import {Utils} from "./utils";
import {Reserve} from "../interfaces/reserve";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map((key, index) => {
      // @ts-ignore
      object[key] = Utils.ixcValueToNormalisedValue(object[key]);
    });
    return object;
  }

  public static mapUserUSDbReserve(userUSDbReserve: Reserve): Reserve {
    console.log("mapUserUSDbReserve before: ", userUSDbReserve);
    const res = new Reserve(
      Utils.hexToPercent(userUSDbReserve.borrowRate),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentBorrowBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentBorrowBalanceUSD),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentOTokenBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentOTokenBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.lastUpdateTimestamp),
      Utils.hexToPercent(userUSDbReserve.liquidityRate),
      Utils.hexToNumber(userUSDbReserve.originationFee),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.principalBorrowBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.principalBorrowBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.useAsCollateral),
      Utils.hexToNumber(userUSDbReserve.userBorrowCumulativeIndex),
    );
    console.log("mapUserUSDbReserve after: ", res);

    return res;
  }
}
