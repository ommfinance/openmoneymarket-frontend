import { Injectable } from "@angular/core";
import {environment} from "../../../environments/environment";
import {IconWallet} from "../../models/IconWallet";
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconConverter } from "icon-sdk-js";
import {TransactionResultService} from '../transaction-result/transaction-result.service';
import {TokenBalances} from "../../models/TokenBalances";
import {ScoreService} from "../score/score.service";
import {DataLoaderService} from "../data-loader/data-loader.service";

@Injectable({
  providedIn: "root"
})
export class IconexApiService {

  /*
  * https://www.icondev.io/docs/chrome-extension-connect
  */

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private transactionResultService: TransactionResultService,
              private scoreService: ScoreService,
              private dataLoaderService: DataLoaderService) { }

  public iconexEventHandler( e: any): void {
    const {type, payload} = e.detail;
    console.log(type, " : ", payload);

    switch (type) {
      case "RESPONSE_HAS_ACCOUNT": {
        if (payload.hasAccount) { this.requestAddress(); }
        else { alert("Wallet does not exist. (Not logged in Iconex?)"); }
        break;
      }
      case "RESPONSE_ADDRESS": {
        this.persistenceService.iconexLogin(new IconWallet(payload, new TokenBalances()));
        this.dataLoaderService.loadUserUSDbReserveData();
        this.dataLoaderService.loadUserIcxReserveData();
        this.iconApiService.getIcxBalance(payload).then((icxBalance: number) => {
          console.log("ICX balance: ", icxBalance);
          this.persistenceService.iconexWallet!.balances.ICX = icxBalance;
          this.scoreService.getUserBalanceOfUSDb(payload).then((USDbBalance: number) => {
            console.log("USDb balance: ", USDbBalance);
            this.persistenceService.iconexWallet!.balances.USDb = USDbBalance;
          });
        });
        console.log("Successfully connected your Icon wallet!");
        break;
      }
      case "RESPONSE_JSON-RPC": {
        console.log("RESPONSE_JSON-RPC", payload.result);
        this.transactionResultService.processIconexTransactionResult(payload);
        break;
      }
      case "CANCEL_JSON-RPC": {
        alert("ICONEX send transaction cancelled!");
        break;
      }
      default: {
        console.log("Iconex default response handler:", payload, type);
        break;
      }
    }
  }

  /*
    REQUEST_HAS_ACCOUNT Requests for whether iconex has any icon wallet.
    Returns boolean-typed result in event.
   */
  public hasAccount(): void {
    this.dispatchIconexEvent("REQUEST_HAS_ACCOUNT", null);
  }

  /*
    REQUEST_ADDRESS Requests for the address to use for service.
   */
  public requestAddress(): void {
    this.dispatchIconexEvent("REQUEST_ADDRESS", null);
  }

  public dispatchIconexEvent(requestType: string, payload: any): void {
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: requestType,
        payload
      }}));
  }

  public dispatchSendTransactionEvent(transaction: any, transactionId: number): void {
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: "REQUEST_JSON-RPC",
        payload: {
          jsonrpc: "2.0",
          method: "icx_sendTransaction",
          params: IconConverter.toRawTransaction(transaction),
          id: transactionId
        }
      }
    }));
  }
}
