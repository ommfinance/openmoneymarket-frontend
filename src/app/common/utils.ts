import IconService from 'icon-sdk-js';
import { BigNumber } from "bignumber.js";

export class Utils {

  // Returns value divided by the 10^18 to get normalised value
  public static hex18DecimalToNormalisedNumber(value: number | string): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      // return rounded down to 2 decimals places number
      return +(new BigNumber(value, 16).dividedBy(Math.pow(10, 18))).toFixed(2, BigNumber.ROUND_DOWN);
    } else {
      // return rounded down to 2 decimals places number
      return +(new BigNumber(value).dividedBy(Math.pow(10, 18))).toFixed(2, BigNumber.ROUND_DOWN);
    }
  }

  public static hexToNumber(value: string | number): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      // return rounded down to 2 decimals places number
      return +(new BigNumber(value, 16).toFixed(2, BigNumber.ROUND_DOWN));
    }
    else {
      return value;
    }
  }

  public static hexToPercent(value: string | number): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      return +(new BigNumber(value, 16).dividedBy(Math.pow(10, 16))).toFixed(2, BigNumber.ROUND_DOWN);
    }
    else {
      return value;
    }
  }

  // Returns true if the address is valid EOA address, false otherwise
  public static isEoaAddress(address: string): boolean {
    if (!address) { return false; }
    return IconService.IconValidator.isEoaAddress(address);
  }

  public static formatNumberToNdigits(num: number, digits: number = 2): string {
    const si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "K" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break;
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
  }

  public static formatNumberToUSLocaleString(num: number): string {
    return num.toLocaleString('en-US');
  }

  public static amountToe18MultipliedString(amount: number): string {
    return new BigNumber(amount).multipliedBy(Math.pow(10, 18)).toFixed();
  }

}
