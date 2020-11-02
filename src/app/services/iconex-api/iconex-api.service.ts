import { Injectable } from "@angular/core";
import {environment} from "../../../environments/environment";
import {IconWallet} from "../../models/IconWallet";
import {IconApiService} from "../icon-api-service/icon-api.service";
import {PersistenceService} from "../persistence-service/persistence.service";
import {IconConverter } from "icon-sdk-js";
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {Utils} from '../../common/utils';

@Injectable({
  providedIn: "root"
})
export class IconexApiService {

  /*
  * https://www.icondev.io/docs/chrome-extension-connect
  */

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService) { }

  public iconexEventHandler( e: any): void {
    const {type, payload} = e.detail;

    if (!environment.production) {
      console.log(type, " : ", payload);
    }

    switch (type) {
      case "RESPONSE_HAS_ACCOUNT": {
        if (payload.hasAccount) { this.requestAddress(); }
        else { alert("Wallet does not exist. (Not logged in Iconex?)"); }
        break;
      }
      case "RESPONSE_ADDRESS": {
        this.iconApiService.getIcxBalance(payload).then((result: number) => {
          if (!environment.production) { console.log("Balances: ", result); }
          this.persistenceService.iconexLogin(new IconWallet(payload, result));
        }).catch( err => console.error(err));
        alert("Successfully connected your Icon wallet!");
        break;
      }
      case "RESPONSE_JSON-RPC": {
        console.log(payload.result, "SCORE transaction", "Pending transaction.");
        break;
      }
      default: {
        console.log(type);
        console.log(payload);
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
    // MOCK DISPATCH FLOW, TODO REMOVE
    this.processTransactionResult({
        jsonrpc: "2.0",
        id: transactionId,
        result: "0x4bf74e6aeeb43bde5dc8d5b62537a33ac8eb7605ebbdb51b015c1881b45b3aed"
    });
    // TODO: uncomment when calling real SCORE
    // window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
    //   detail: {
    //     type: "REQUEST_JSON-RPC",
    //     payload: {
    //       jsonrpc: "2.0",
    //       method: "icx_sendTransaction",
    //       params: IconConverter.toRawTransaction(transaction),
    //       id: transactionId
    //     }
    //   }
    // }));
  }

  private processTransactionResult(payload: IconJsonRpcResponse): void {
    if (payload.result) {
      if (this.iconApiService.isTxConfirmed(payload.result)) {
        switch (payload.id) {
          case IconexRequestsMap.DEPOSIT_USDb:
            // TODO: handle what happends after deposited USDb
          // * Get reserve data for a specific reserve -> LendingPoolDataProvider SCORE (that will give USDb reserve information)
          // * Once the user does the deposit -> LendingPoolDataProvider -> get user reserve data for specific user and get user all reserve data
            const result = {
              eventLogs: {
                scoreAddress: "cx1a52a17ee1a2a6bb52e31fc80bee692baa7455a0",
                indexed: ["Transfer(Address,Address,int,bytes)", "hxf34e1cfbf19c88c64631d265d7c71cd2df5ffad3", "hx46935874ef87d87dcf9bc66db0248d2873baf94d", "0x29a2241af62c0000"],
                data: ["0x4e6f6e65"]
              }
            };
            const amount: number = Utils.ixcValueToNormalisedValue(result.eventLogs.indexed[3]);
            console.log("Amount:", amount);
        }
      }

    } else  {
      alert("ICON RPC ERROR: " + payload.error?.message);
    }
  }
}
