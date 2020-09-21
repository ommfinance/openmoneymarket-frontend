import { Injectable } from '@angular/core';
import {Utils} from "../../common/utils";
import IconService from "icon-sdk-js";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class IconApiService {

  public readonly httpProvider = new IconService.HttpProvider(environment.iconRpcUrl);
  public readonly iconService = new IconService(this.httpProvider);

  constructor() { }

  async getIcxBalance(address: string): Promise<number> {
    if (!address) throw "getIcxBalance -> address empty or null!";
    const icxBalance = await this.iconService.getBalance(address).execute();
    return Utils.ixcValueToNormalisedValue(+icxBalance["c"].join(''))
  }

}
