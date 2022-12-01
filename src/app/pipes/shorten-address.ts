import { Pipe, PipeTransform } from '@angular/core';
import {Utils} from "../common/utils";

@Pipe({
  name: 'shortenAddress'
})
export class ShortenAddressPipePipe implements PipeTransform {

  transform(address: string, n = 4): string {
    return Utils.formatIconAddressToShort(address, n);
  }

}
