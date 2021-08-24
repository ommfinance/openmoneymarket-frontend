import { Pipe, PipeTransform } from '@angular/core';
import {BigNumber} from "bignumber.js";
import {Utils} from "../common/utils";

@Pipe({
  name: 'roundOff0Dec'
})
export class RoundOff0DecPipe implements PipeTransform {

  transform(value: BigNumber | string | undefined): string {
    return this.roundOffTo0Decimals(value);
  }

  private roundOffTo0Decimals(value: BigNumber | string | undefined): string {
    if (!value) {
      return "0";
    }
    return Utils.roundOffTo0Decimals(value);
  }

}
