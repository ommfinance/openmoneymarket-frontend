import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from "../common/utils";
import {BigNumber} from "bignumber.js";

@Pipe({
  name: 'roundDown2Dec'
})
export class RoundDown2DecPipe implements PipeTransform {

  transform(value: number | BigNumber | string | undefined): number {
    return Utils.roundDownTo2Decimals(value);
  }

}
