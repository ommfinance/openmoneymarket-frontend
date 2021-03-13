import IconService from 'icon-sdk-js';
import {BigNumber} from "bignumber.js";
import {AssetTag} from "../models/Asset";

export class Utils {

  // Returns number divided by the 10^decimals and rounded down to 2 decimal places
  public static hexTo2DecimalRoundedOff(value: number | string, decimals: number = 18): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      // return rounded down to 2 decimals places number
      return +Utils.roundOffTo2Decimals(new BigNumber(value, 16).dividedBy(Math.pow(10, decimals)));
    } else {
      // return rounded down to 2 decimals places number
      return +Utils.roundOffTo2Decimals(new BigNumber(value).dividedBy(Math.pow(10, decimals)));
    }
  }

  // Returns number divided by the 10^decimals
  public static hexToNormalisedNumber(value: number | string, decimals: number = 18): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      return +(new BigNumber(value, 16).dividedBy(Math.pow(10, decimals)));
    } else {
      return +(new BigNumber(value).dividedBy(Math.pow(10, decimals)));
    }
  }

  public static hexToNumber(value: string | number): number {
    if (!value) {
      return 0;
    }
    if (typeof value === "string") {
      // return rounded down to 2 decimals places number
      return +Utils.roundOffTo2Decimals(new BigNumber(value, 16));
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

  public static normalisedAmountToBaseAmountString(amount: number, decimals: number = 18): string {
    return new BigNumber(amount).multipliedBy(Math.pow(10, decimals)).toFixed();
  }

  public static roundOffTo2Decimals(value: number | BigNumber | string): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(2, BigNumber.ROUND_HALF_CEIL));
    } else {
      return +(new BigNumber(value).toFixed(2, BigNumber.ROUND_HALF_CEIL));
    }
  }

  public static roundDownTo2Decimals(value: number | BigNumber | string): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(2, BigNumber.ROUND_DOWN));
    } else {
      return +(new BigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
    }
  }

  public static convertICXTosICX(value: number, todayRate: number): number {
    return Utils.roundOffTo2Decimals(value / todayRate);
  }

  public static convertSICXToICX(sICXvalue: number, sIcxToIcxRate: number): number {
    return sICXvalue * sIcxToIcxRate;
  }

  public static convertIfICXTosICX(value: number, todayRate: number, assetTag: AssetTag): number {
    if (assetTag === AssetTag.ICX) {
      return Utils.roundOffTo2Decimals(value / todayRate);
    } else {
      return value;
    }
  }

  public static convertIfSICXToICX(value: number, sIcxToIcxRate: number, assetTag: AssetTag): number {
    if (assetTag === AssetTag.ICX) {
      return value * sIcxToIcxRate;
    } else {
      return value;
    }
  }

}
