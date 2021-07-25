import IconService from 'icon-sdk-js';
import {BigNumber} from "bignumber.js";
import bigDecimal from "js-big-decimal";
import {AssetTag} from "../models/Asset";
import {BridgeWidgetAction} from "../models/BridgeWidgetAction";
import log from "loglevel";

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
      return +Utils.roundDownTo2Decimals(new BigNumber(value, 16));
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

  public static roundOffToCustomDecimals(value: number | BigNumber | string, decimals: number): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(decimals, BigNumber.ROUND_HALF_CEIL));
    } else {
      return +(new BigNumber(value).toFixed(decimals, BigNumber.ROUND_HALF_CEIL));
    }
  }

  public static roundOffTo2Decimals(value: number | BigNumber | string): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(2, BigNumber.ROUND_HALF_CEIL));
    } else {
      return +(new BigNumber(value).toFixed(2, BigNumber.ROUND_HALF_CEIL));
    }
  }

  public static roundDownTo2Decimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }

    if (value instanceof BigNumber) {
      return +(value.toFixed(2, BigNumber.ROUND_DOWN));
    } else {
      return +(new BigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
    }
  }

  public static roundUpTo2Decimals(value: number | BigNumber | string): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(2, BigNumber.ROUND_UP));
    } else {
      return +(new BigNumber(value).toFixed(2, BigNumber.ROUND_UP));
    }
  }

  public static roundDownToZeroDecimals(value: number | BigNumber | string): number {
    if (value instanceof BigNumber) {
      return +(value.toFixed(0, BigNumber.ROUND_DOWN));
    } else {
      return +(new BigNumber(value).toFixed(0, BigNumber.ROUND_DOWN));
    }
  }

  public static convertICXTosICX(value: number, todayRate: number): number {
    return value / todayRate;
  }

  public static convertSICXToICX(sICXvalue: number, sIcxToIcxRate: number): number {
    return sICXvalue * sIcxToIcxRate;
  }

  public static convertIfICXTosICX(value: number, todayRate: number, assetTag: AssetTag): number {
    if (assetTag === AssetTag.ICX) {
      return value / todayRate;
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

  public static subtractDecimalsWithPrecision(val1: number, val2: number, precision: number = 2): number {
    return +(new bigDecimal(val1.toString()).subtract(new bigDecimal(val2.toString()))).round(precision,
      bigDecimal.RoundingModes.DOWN).getValue();
  }

  public static addDecimalsPrecision(val1: number = 0, val2: number = 0, precision: number = 2): number {
    return +(new bigDecimal(val1.toString()).add(new bigDecimal(val2.toString()))).round(precision,
      bigDecimal.RoundingModes.DOWN).getValue();
  }

  public static divideDecimalsPrecision(val1: number, val2: number, precision: number = 2): number {
    if (val1 === 0 || val2 === 0) {
      return 0;
    }

    return +(new bigDecimal(val1.toString()).divide(new bigDecimal(val2.toString()), precision))
      .round(precision, bigDecimal.RoundingModes.DOWN).getValue();
  }

  public static multiplyDecimalsPrecision(val1: number, val2: number, precision: number = 2): number {
    if (val1 === 0 || val2 === 0) {
      return 0;
    }

    return +(new bigDecimal(val1.toString()).multiply(new bigDecimal(val2.toString())))
      .round(precision, bigDecimal.RoundingModes.DOWN).getValue();
  }

  public static formatIconAddressToShort(address: string): string {
    const length = address.length;
    return address.substring(0, 7) + "..." + address.substring(length - 7, length);
  }

  public static getNumberOfDaysInCurrentMonth(): number {
    const tmp = new Date();
    const d = new Date(tmp.getFullYear(), tmp.getMonth() + 1, 0);
    return d.getDate();
  }

  public static extractTxFailureMessage(tx: any): string {
    return tx?.failure?.message ?? "";
  }

  public static dispatchBridgeWidgetAction(action: BridgeWidgetAction): void {
    const event = new CustomEvent('bri.widget', {
      detail: {
        action: action.valueOf()
      }
    });
    log.debug("Dispatched Bridge event: ", event);
    window.dispatchEvent(event);
  }

  public static makeNegativeNumber(value: number | string): number {
    if (typeof value === "string") {
      return -Math.abs(+value);
    } else {
      return -Math.abs(value);
    }
  }

  public static isUndefinedOrZero(value?: number): boolean {
    return (!value) || value === 0;
  }
}
