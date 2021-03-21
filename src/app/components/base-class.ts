import {Utils} from "../common/utils";
import {Asset, AssetTag, supportedAssetsMap} from "../models/Asset";
import {assetFormat} from "../common/formats";
import log from "loglevel";
import {BigNumber} from "bignumber.js";
import {PersistenceService} from "../services/persistence/persistence.service";


/*
* Base class to be used as extension in component in order to inherit useful methods
*/
export class BaseClass {

  constructor(public persistenceService: PersistenceService) {
  }

  public supportedAssetsMap = supportedAssetsMap;
  public AssetTag = AssetTag;
  public supportedAssets: Asset[] = Array.from(supportedAssetsMap.values());

  // public formatNumberToNdigits(num?: number | string, digits: number = 2): string {
  //   if (!num || (+num) === 0) { return "-"; }
  //   if (typeof num === 'string') {
  //     return Utils.formatNumberToNdigits(+num, digits);
  //   } else {
  //     return Utils.formatNumberToNdigits(num, digits);
  //   }
  // }

  // public toDollar2digitsString(num?: number | string): string {
  //   if (!num || (+num) === 0) { return "-"; }
  //   return `$${this.formatNumberToNdigits(num)}`;
  // }

  public roundOffTo2Decimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }
    return Utils.roundOffTo2Decimals(value);
  }

  public roundDownTo2Decimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }
    return Utils.roundDownTo2Decimals(value);
  }

  // public toDollar2digitsStringOrZero(num?: number | string): string {
  //   if (!num || (+num) === 0) { return "$0"; }
  //   return `$${this.formatNumberToNdigits(num)}`;
  // }

  public formatNumberToUSLocaleString(num?: number | string, defaultZero = false): string {
    if (!num || (+num) === 0) { return defaultZero ? "0" : "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToUSLocaleString(+num);
    } else {
      return Utils.formatNumberToUSLocaleString(num);
    }
  }

  public toDollarUSLocaleString(num?: number | string, defaultZero = false): string {
    if (!num || (+num) === 0) { return defaultZero ? "0" : "-"; }
    return `$${this.formatNumberToUSLocaleString(num)}`;
  }

  public to2DecimalRoundedOffPercentString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }

    // convert in to percentage
    num = +num * 100;
    const res = `${(Utils.roundOffTo2Decimals(num))}%`;
    return res;
  }

  public to0DecimalPercentString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }

    // convert in to percentage
    num = +num * 100;
    const res = `${(num.toFixed())}%`;
    return res;
  }

  public fromUSDbFormatToNumber(value: any): number {
    if (!value) {
      return 0;
    }
    return +assetFormat(AssetTag.USDb).from(value);
  }

  public fromNumberToUSDbFormat(value: number): string {
    if (!value) {
      return "- USDb";
    }
    return assetFormat(AssetTag.USDb).to(value);
  }

  public hideElement(hide: boolean): any {
    return {display: hide ? 'none' : null};
  }

  public hideElementOrDisplayContents(hide: boolean): any {
    return {display: hide ? 'none' : 'contents'};
  }

  public displayAsTableRowOrHide(show: boolean): any {
    return {display: show ? 'table-row' : 'none'};
  }

  public displayAsBlockOrHide(show: boolean): any {
    return {display: show ? 'block' : 'none'};
  }

  public convertFromICXTosICX(ICXvalue: number | undefined): number {
    if (!ICXvalue) { return 0; }
    return ICXvalue / this.persistenceService.sIcxToIcxRate();
  }

  public convertSICXToICX(sICXvalue: number): number {
    return sICXvalue * this.persistenceService.sIcxToIcxRate();
  }

  public listIsNotNullOrEmpty(list?: any[]): boolean {
    return (list != null && list.length > 0);
  }

}
