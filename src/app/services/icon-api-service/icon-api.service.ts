import { Injectable } from "@angular/core";
import {Utils} from "../../common/utils";
import IconService, { IconBuilder, IconAmount, IconConverter } from "icon-sdk-js";
const { CallBuilder, CallTransactionBuilder, IcxTransactionBuilder, CallTransaction, IcxTransaction } = IconBuilder;
import {environment} from "../../../environments/environment";
import {IconTransactionType} from "../../models/IconTransactionType";

@Injectable({
  providedIn: "root"
})
export class IconApiService {

  public readonly httpProvider = new IconService.HttpProvider(environment.iconRpcUrl);
  public readonly iconService = new IconService(this.httpProvider);

  constructor() { }

  async getIcxBalance(address: string): Promise<number> {
    if (!address) {
      throw new Error("getIcxBalance -> address empty or null!");
    }
    const icxBalance = await this.iconService.getBalance(address).execute();
    return Utils.ixcValueToNormalisedValue(+icxBalance.c.join(""));
  }

  public isTxConfirmed(txHash: string): boolean {
    return this.iconService.getTransactionResult(txHash).execute()
      .then((res: any) => {
        if (res.status === 1) {
          console.log('Transaction confirmed.');
          return true;
        } else {
          console.log('Transaction failed (not confirmed).');
          return false;
        }
      })
      .catch((err: any) => {
        if (err.includes('Pending transaction')) {
          setTimeout(this.isTxConfirmed.bind(null, txHash), 2000);
        } else {
          console.error(err);
          throw String(err.message);
        }
      });
  }


  public buildTransaction(from: string, to: string, method: string, params: any, transactionType: IconTransactionType,
                          value?: number): string {
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
}
