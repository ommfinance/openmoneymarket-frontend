import {Utils} from "../common/utils";
import {AssetTag, supportedAssetsMap} from "../models/Asset";
import {assetFormat} from "../common/formats";


/*
* Base class to be used as extension in component in order to inherit useful methods
*/
export class BaseClass {

  public supportedAssetsMap = supportedAssetsMap;
  public AssetTag = AssetTag;

  public formatNumberToNdigits(num?: number | string, digits: number = 2): string {
    if (!num || (+num) === 0) { return "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToNdigits(+num, digits);
    } else {
      return Utils.formatNumberToNdigits(num, digits);
    }
  }

  public toDollar2digitsString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }
    return `$${this.formatNumberToNdigits(num)}`;
  }

  public toDollar2digitsStringOrZero(num?: number | string): string {
    if (!num || (+num) === 0) { return "$0"; }
    return `$${this.formatNumberToNdigits(num)}`;
  }

  public formatNumberToUSLocaleString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToUSLocaleString(+num);
    } else {
      return Utils.formatNumberToUSLocaleString(num);
    }
  }

  public toDollarUSLocaleString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }
    return `$${this.formatNumberToUSLocaleString(num)}`;
  }

  public to2DecimalPercentString(num?: number | string): string {
    if (!num || (+num) === 0) { return "-"; }
    if (typeof num === 'string') {
      return `${(+num).toFixed(2)}%`;
    } else {
      return `${(num).toFixed(2)}%`;
    }
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

}
