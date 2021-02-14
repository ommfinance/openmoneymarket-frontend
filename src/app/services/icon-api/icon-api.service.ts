import { Injectable } from "@angular/core";
import {Utils} from "../../common/utils";
import IconService, {IconBuilder, IconAmount, IconConverter} from 'icon-sdk-js';
const { CallBuilder, CallTransactionBuilder, IcxTransactionBuilder,  } = IconBuilder;
import {environment} from "../../../environments/environment";
import {IconTransactionType} from "../../models/IconTransactionType";
import log from "loglevel";


@Injectable({
  providedIn: "root"
})
export class IconApiService {

  public httpProvider;
  public iconService;

  constructor() {
    this.httpProvider = new IconService.HttpProvider(environment.iconRpcUrl);
    this.iconService = new IconService(this.httpProvider);
  }

  async getIcxBalance(address: string): Promise<number> {
    if (!address) {
      throw new Error("getIcxBalance -> address empty or null!");
    }
    const icxBalance = await this.iconService.getBalance(address).execute();
    return Utils.hexE18ToNormalisedNumber(icxBalance);
  }

  public async getTxResult(txHash: string): Promise<any> {
      return await this.iconService.getTransactionResult(txHash).execute();
  }


  public buildTransaction(from: string, to: string, method: string, params: any, transactionType: IconTransactionType,
                          value?: number): any {
    let tx = null;
    const timestamp = (new Date()).getTime() * 1000;
    const nonce = IconConverter.toHex(IconConverter.toBigNumber(1));
    const stepLimit = IconConverter.toHex(IconConverter.toBigNumber(2000000));
    const version = IconConverter.toHex((IconConverter.toBigNumber(3)));
    const nid = IconConverter.toHex(IconConverter.toBigNumber(3));
    value = value ? IconConverter.toHex(IconAmount.of(value, IconAmount.Unit.ICX).toLoop()) : "0x0";

    switch (transactionType) {
      case IconTransactionType.WRITE:
        /* Build `CallTransaction` instance for executing SCORE function. */
        tx = new CallTransactionBuilder()
          .from(from)
          .to(to)
          .stepLimit(stepLimit)
          .nid(nid)
          .value(value)
          .nonce(nonce)
          .version(version)
          .timestamp(timestamp)
          .method(method)
          .params(params)
          .build();
        break;
      case IconTransactionType.READ:
        /* Build `Call` instance for calling external i.e. read methods . */
        tx = new CallBuilder()
          .to(to)
          .method(method)
          .params(params)
          .build();
        break;
      case IconTransactionType.TRANSFER:
        /* Build `IcxTransaction` instance for sending ICX. */
        tx = new IcxTransactionBuilder()
          .from(from)
          .to(to)
          .value(value)
          .stepLimit(stepLimit)
          .nid(nid)
          .nonce(nonce)
          .version(version)
          .timestamp(timestamp)
          .build();
        break;
      default:
        break;
    }

    return tx;
  }

  public async sendTransaction(signedTx: any): Promise<string> {
    try {
      const txHash = await this.iconService.sendTransaction(signedTx).execute();
      log.debug("Tx hash ", txHash);
      return txHash;
    } catch (e) {
      throw e;
    }
  }
}
