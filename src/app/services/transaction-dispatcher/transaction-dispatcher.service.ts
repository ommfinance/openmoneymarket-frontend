import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../bridge-widget/bridge-widget.service";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import {LedgerService} from "../ledger/ledger.service";
import {NotificationService} from "../notification/notification.service";
import {IconApiService} from "../icon-api/icon-api.service";
import {IconConverter} from "icon-sdk-js";
import {TransactionResultService} from "../transaction-result/transaction-result.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {IconexId} from "../../models/IconexId";

@Injectable({
  providedIn: 'root'
})
export class TransactionDispatcherService {

  constructor(
    private persistenceService: PersistenceService,
    private iconexApiService: IconexApiService,
    private bridgeWidgetService: BridgeWidgetService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private iconApiService: IconApiService,
    private transactionResultService: TransactionResultService,
    private localStorageService: LocalStorageService) { }

  /**
   * Method that dispatches the built tx to Icon network (through Iconex, Bridge or directly) and triggers the proper notification
   */
  async dispatchTransaction(tx: any, notificationMessage: string): Promise<void> {
    try {
      const estimatedStepCost = await this.iconApiService.estimateStepCost(IconConverter.toRawTransaction(tx));

      if (estimatedStepCost) {
        tx.stepLimit = this.iconApiService.convertNumberToHex(Math.round(estimatedStepCost * 1.1));
      }

      if (this.persistenceService.activeWallet instanceof IconexWallet) {
        this.iconexApiService.dispatchSendTransactionEvent(tx, IconexId.SHOW_MESSAGE_HIDE_MODAL);
        this.notificationService.setNotificationToShow(notificationMessage);
      } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
        this.bridgeWidgetService.sendTransaction(tx);
        this.notificationService.showNewNotification(notificationMessage);
      } else if (this.persistenceService.activeWallet instanceof LedgerWallet) {
        const signedRawTx = await this.ledgerService.signTransaction(IconConverter.toRawTransaction(tx));
        this.notificationService.showNewNotification(notificationMessage);

        const txHash = await this.iconApiService.sendTransaction({
          getProperties: () => signedRawTx,
          getSignature: () => signedRawTx.signature,
        });

        this.transactionResultService.processIconTransactionResult(txHash);
      }
    } catch (e) {
      this.transactionResultService.showFailedActionNotification(e?.message ?? "", this.localStorageService.getLastModalAction());
    }
  }

}
