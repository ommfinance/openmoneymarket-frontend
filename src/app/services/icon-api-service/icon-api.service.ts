import { Injectable } from "@angular/core";
import {Utils} from "../../common/utils";
import IconService, {IconBuilder, IconAmount, IconConverter} from 'icon-sdk-js';
const { CallBuilder, CallTransactionBuilder, IcxTransactionBuilder,  } = IconBuilder;
import {environment} from "../../../environments/environment";
import {IconTransactionType} from "../../models/IconTransactionType";

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
    return Utils.ixcValueToNormalisedValue(+icxBalance.c.join(""));
  }

  public async getTxResult(txHash: string): Promise<any> {
      return await this.iconService.getTransactionResult(txHash).execute();
  }


  public buildTransaction(from: string, to: string, method: string, params: any, transactionType: IconTransactionType,
                          value?: number): any {
    let tx = null;
    const timestamp = (new Date()).getTime() * 1000;
    const nonce = IconConverter.toBigNumber(1);
    const stepLimit = IconConverter.toBigNumber(2000000);
    const version = IconConverter.toBigNumber(3);
    const nid = IconConverter.toBigNumber(3);
    value = value ? IconAmount.of(value, IconAmount.Unit.ICX).toLoop() : undefined;

    switch (transactionType) {
      case IconTransactionType.WRITE:
        /* Build `CallTransaction` instance for executing SCORE function. */
        tx = new CallTransactionBuilder()
          .from(from)
          .to(to)
          .stepLimit(stepLimit)
          .nid(nid)
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

  public async sendTransaction(signedTransaction: any): Promise<any> {
    // Send signed transaction
    // const txHash = await this.iconService.sendTransaction(signedTransaction).execute();
    // Print transaction hash
    // console.log(txHash);
    return "0x6b17886de346655d96373f2e0de494cb8d7f36ce9086cb15a57d3dcf24523c8f"; // MOCK tx hash TODO uncomment
  }
}
