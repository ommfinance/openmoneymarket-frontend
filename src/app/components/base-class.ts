import {Utils} from "../common/utils";
import {Asset, AssetTag, supportedAssetsMap} from "../models/Asset";
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
  public ZERO = new BigNumber("0");

  public delay = (() => {
    let timer: any;
    return (callback: any, ms: any) => {
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
    };
  })();

  public roundDownTo2Decimals(value: BigNumber | string | undefined): string {
    if (!value || !(new BigNumber(value).isFinite())) {
      return "0";
    }
    return Utils.roundDownTo2Decimals(value);
  }

  public roundUpTo2Decimals(value: BigNumber | string | undefined): BigNumber {
    if (!value || !(new BigNumber(value).isFinite())) {
      return new BigNumber("0");
    }
    return Utils.roundUpTo2Decimals(value);
  }

  public roundDownToZeroDecimals(value: BigNumber | string | undefined): string {
    if (!value || !(new BigNumber(value).isFinite())) {
      return "0";
    }
    return Utils.roundDownToZeroDecimals(value);
  }

  public formatNumberToUSLocaleString(num?: BigNumber | string, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0" : "-"; }
    if (typeof num === 'string') {
      return Utils.formatNumberToUSLocaleString(new BigNumber(num));
    } else {
      return Utils.formatNumberToUSLocaleString(num);
    }
  }

  public toDollarUSLocaleString(num?: BigNumber | string, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0" : "-"; }
    return `$${this.formatNumberToUSLocaleString(num)}`;
  }

  public to2DecimalRoundedOffPercentString(num?: BigNumber | string, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0%" : "-"; }

    // convert in to percentage
    num = new BigNumber(num).multipliedBy(new BigNumber("100"));

    // handle values smaller than 0.01%
    if (num.isLessThan(new BigNumber("0.01"))) {
      return Utils.handleSmallDecimal(num);
    }

    return `${(this.formatNumberToUSLocaleString(Utils.roundOffTo2Decimals(num)))}%`;
  }

  public to0DecimalRoundedDownPercentString(num?: BigNumber | string, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0%" : "-"; }

    // convert in to percentage
    num = new BigNumber(num).multipliedBy(new BigNumber("100"));

    if (num.isLessThan(1)) {
      return defaultZero ? "0%" : "-";
    }

    return `${(this.formatNumberToUSLocaleString(Utils.roundDownToZeroDecimals(num)))}%`;
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

  public convertFromICXTosICX(ICXvalue: BigNumber | undefined): BigNumber {
    if (!ICXvalue || !(new BigNumber(ICXvalue).isFinite())) { return new BigNumber("0"); }
    return ICXvalue.dividedBy(this.persistenceService.sIcxToIcxRate());
  }

  public convertSICXToICX(sICXvalue: BigNumber): BigNumber {
    return sICXvalue.multipliedBy(this.persistenceService.sIcxToIcxRate());
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

  makeAbsolute(value: BigNumber): BigNumber {
    return value.abs();
  }

  isNegative(value: BigNumber): boolean {
    return value.isNegative();
  }

  isProduction(): boolean {
    return environment.production;
  }

  public timestampInMillisecondsToPrettyDate(timestamp?: BigNumber): string {
    if (!timestamp) { return ""; }
    return Utils.timestampInMillisecondsToPrettyDate(timestamp);
  }

  public addTimestampToNowToPrettyDate(timestamp?: BigNumber): string {
    if (!timestamp) { return ""; }
    return this.timestampInMillisecondsToPrettyDate(Utils.timestampNowMilliseconds().plus(timestamp));
  }

}
