import {Utils} from "../common/utils";


export class BaseClass {
  public formatNumberToNdigits(num: number, digits: number = 2): string {
    return Utils.formatNumberToNdigits(num, digits);
  }

  public formatNumberToUSLocaleString(num: number): string {
    return Utils.formatNumberToUSLocaleString(num);
  }
}
