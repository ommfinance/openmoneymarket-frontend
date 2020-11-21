import {Utils} from "./utils";
import {UserUSDbReserve} from "../interfaces/user-usdb-reserve";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map(function(key, index) {
      // @ts-ignore
      object[key] = Utils.ixcValueToNormalisedValue(object[key]);
    });
    return object;
  }

  public static mapUserUSDbReserve(userUSDbReserve: UserUSDbReserve): UserUSDbReserve {
    console.log("mapUserUSDbReserve before: ", userUSDbReserve)
    const res = new UserUSDbReserve(
      Utils.hexToNumber(userUSDbReserve.borrowRate),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentBorrowBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentBorrowBalanceUSD),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentOTokenBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.currentOTokenBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.lastUpdateTimestamp),
      Utils.hexToNumber(userUSDbReserve.liquidityRate),
      Utils.hexToNumber(userUSDbReserve.originationFee),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.principalBorrowBalance),
      Utils.ixcValueToNormalisedValue(userUSDbReserve.principalBorrowBalanceUSD),
      Utils.hexToNumber(userUSDbReserve.useAsCollateral),
      Utils.hexToNumber(userUSDbReserve.userBorrowCumulativeIndex),
    );
    console.log("mapUserUSDbReserve after: ", res)

    return res;
  }
}
