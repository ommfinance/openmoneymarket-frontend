import {AllReserves} from "../interfaces/AllReserves";
import {Utils} from "./utils";

export class Mapper {
  public static mapAllReserves(allReserves: AllReserves): AllReserves {
    Object.keys(allReserves.USDb).map(function(key, index) {
      // @ts-ignore
      allReserves.USDb[key] = Utils.ixcValueToNormalisedValue(allReserves.USDb[key]).toFixed(2);
    });
    return allReserves;
  }
}
