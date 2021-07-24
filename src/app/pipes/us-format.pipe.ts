import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {Utils} from "../common/utils";

@Pipe({
  name: 'usFormat'
})
export class UsFormatPipe implements PipeTransform {

  transform(amount?: string | number | BigNumber): string {
    return this.formatNumberToUSLocaleString((amount));
  }

  public formatNumberToUSLocaleString(num?: number | string | BigNumber, defaultZero = false): string {
    if (!num || (+num) === 0) { return defaultZero ? "0" : "-"; }
    if (typeof num === 'string' || num instanceof BigNumber) {
      return Utils.formatNumberToUSLocaleString(+num);
    } else {
      return Utils.formatNumberToUSLocaleString(num);
    }
  }

}
