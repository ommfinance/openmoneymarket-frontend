import {Utils} from "../common/utils";
import {AssetTag, supportedAssetsMap} from "../models/Asset";
import {assetFormat} from "../common/formats";


/*
* Base class to be used as extension in component in order to inherit useful methods
*/
export class BaseClass {

  public supportedAssetsMap = supportedAssetsMap;
  public AssetTag = AssetTag;

  public formatNumberToNdigits(num: number | string | undefined, digits: number = 2): string {
    if (!num) { return "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToNdigits(+num, digits);
    } else {
      return Utils.formatNumberToNdigits(num, digits);
    }
  }

  public formatNumberToUSLocaleString(num: number | string | undefined): string {
    if (!num) { return "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToUSLocaleString(+num);
    } else {
      return Utils.formatNumberToUSLocaleString(num);
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

  public displayAsTableRow(show: boolean): any {
    return {display: show ? 'table-row' : null};
  }

  public displayAsBlock(show: boolean): any {
    return {display: show ? 'block' : null};
  }

}
