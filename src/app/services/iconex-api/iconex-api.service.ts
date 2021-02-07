import { Injectable } from "@angular/core";
import {IconexWallet} from "../../models/IconexWallet";
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconConverter } from "icon-sdk-js";
import {TransactionResultService} from '../transaction-result/transaction-result.service';
import {ScoreService} from "../score/score.service";
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {OmmError} from "../../core/errors/OmmError";
import {NotificationService} from "../notification/notification.service";

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
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService) { }

  public iconexEventHandler( e: any): void {
    const {type, payload} = e.detail;
    log.debug(type, " : ", payload);

    switch (type) {
      case "RESPONSE_HAS_ACCOUNT": {
        if (payload.hasAccount) { this.requestAddress(); }
        else {
          this.notificationService.showNewNotification("Wallet does not exist. Please log in to Iconex and try again.");
        }
        break;
      }
      case "RESPONSE_ADDRESS": {
        this.dataLoaderService.walletLogin(new IconexWallet(payload));
        log.debug("Successfully connected your Icon wallet!");
        break;
      }
      case "RESPONSE_SIGNING": {
        console.log(payload); // e.g., 'q/dVc3qj4En0GN+...'
        break;
      }
      case "RESPONSE_JSON-RPC": {
        log.debug("RESPONSE_JSON-RPC", payload.result);
        this.transactionResultService.processIconexTransactionResult(payload);
        break;
      }
      case "CANCEL_JSON-RPC": {
        throw new OmmError("ICONEX send transaction cancelled!");
      }
      default: {
        log.debug("Iconex default response handler:", payload, type);
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

  public dispatchSignTransactionEvent(transaction: any): void {
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: "REQUEST_SIGNING",
        payload: IconConverter.toRawTransaction(transaction)
      }
    }));
  }
}
