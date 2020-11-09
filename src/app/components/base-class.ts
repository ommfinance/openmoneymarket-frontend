import {Utils} from "../common/utils";


export class BaseClass {
  public formatNumberToNdigits(num: number | string | undefined, digits: number = 2): string {
    if (!num) return "0,00";
    if (typeof num === 'string') {
      return Utils.formatNumberToNdigits(+num, digits)
    } else {
      return Utils.formatNumberToNdigits(num, digits);
    }
  }

  public formatNumberToUSLocaleString(num: number | string | undefined): string {
    if (!num) return "0,00";
    if (typeof num === 'string') {
      return Utils.formatNumberToUSLocaleString(+num);
    } else {
      return Utils.formatNumberToUSLocaleString(num);
    }
  }
}
