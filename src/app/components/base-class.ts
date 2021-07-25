import {Utils} from "../common/utils";
import {Asset, AssetTag, supportedAssetsMap} from "../models/Asset";
import {assetFormat} from "../common/formats";
import {BigNumber} from "bignumber.js";
import {PersistenceService} from "../services/persistence/persistence.service";
import {environment} from "../../environments/environment";


/*
* Base class to be used as extension in component in order to inherit useful methods
*/
export class BaseClass {

  constructor(public persistenceService: PersistenceService) {
  }

  public supportedAssetsMap = supportedAssetsMap;
  public AssetTag = AssetTag;
  public supportedAssets: Asset[] = Array.from(supportedAssetsMap.values());

  public delay = (() => {
    let timer: any;
    return (callback: any, ms: any) => {
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
    };
  })();

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

  public roundOffToCustomDecimals(value: number | BigNumber | string | undefined, decimals: number): number {
    if (!value) {
      return 0;
    }
    return Utils.roundOffToCustomDecimals(value, decimals);
  }

  public roundDownTo2Decimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }
    return Utils.roundDownTo2Decimals(value);
  }

  public roundDownToZeroDecimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }
    return Utils.roundDownToZeroDecimals(value);
  }

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

    return `${(this.formatNumberToUSLocaleString(Utils.roundOffTo2Decimals(num)))}%`;
  }

  public fromUSDbFormatToNumber(value: any): number {
    if (!value) {
      return 0;
    }
    return +assetFormat(AssetTag.USDS).from(value);
  }

  public fromNumberToUSDbFormat(value: number): string {
    if (!value) {
      return "- USDb";
    }
    return assetFormat(AssetTag.USDS).to(value);
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

  public userLoggedIn(): boolean {
    return this.persistenceService.userLoggedIn();
  }

  formatIconAddressToShort(address: string): string {
    return Utils.formatIconAddressToShort(address);
  }

  addClass(htmlElement: any, className: string): void {
    htmlElement.classList.add(className);
  }

  removeClass(htmlElement: any, className: string): void {
    htmlElement.classList.remove(className);
  }

  setText(htmlElement: any, text: string): void {
    htmlElement.textContent = text;
  }

  getText(htmlElement: any): string {
    return htmlElement.textContent ?? "";
  }

  makeAbsolute(value: number): number {
    return Math.abs(value);
  }

  isNegative(value: number): boolean {
    return value < 0;
  }

  isProduction(): boolean {
    return environment.production;
  }

}
