import {AllReserves} from "../interfaces/all-reserves";
import {Utils} from "./utils";

export class Mapper {
  public static mapHexStringsOfObjectToNormalisedValue<T>(object: T): T {
    Object.keys(object).map(function(key, index) {
      // @ts-ignore
      object[key] = Utils.ixcValueToNormalisedValue(object[key]);
    });
    return object;
  }
}
