import { Pipe, PipeTransform } from '@angular/core';
import {BigNumber} from "bignumber.js";
import {Utils} from "../common/utils";

@Pipe({
  name: 'roundOff2Dec'
})
export class RoundOff2DecPipe implements PipeTransform {

  transform(value: number | BigNumber | string | undefined): number {
    return this.roundOffTo2Decimals(value);
  }

  private roundOffTo2Decimals(value: number | BigNumber | string | undefined): number {
    if (!value) {
      return 0;
    }
    return Utils.roundOffTo2Decimals(value);
  }

}
