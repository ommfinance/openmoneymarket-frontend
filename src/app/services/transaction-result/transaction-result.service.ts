import {Injectable} from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {NotificationService} from "../notification/notification.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {environment} from "../../../environments/environment";
import {OmmError} from "../../core/errors/OmmError";
import {ModalAction} from "../../models/ModalAction";
import {AssetAction} from "../../models/AssetAction";
import {Modals} from "../../models/Modals";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              private localStorageService: LocalStorageService) {
    window.addEventListener("bri.tx.result", (e) => this.processBridgeTransactionResult(e));
  }

  public processIconexTransactionResult(payload: IconJsonRpcResponse): void {
    log.debug("processIconexTransactionResult -> payload: ", payload);
    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).
      then((res: any) => {
        // get last modal action from localstorage
        const modalAction: ModalAction = this.localStorageService.getLastModalAction();
        const assetAction: AssetAction = modalAction.assetAction!;
        // success
        if (res.status === 1) {
          // show proper success notification
          this.showSuccessActionNotification(modalAction, assetAction);

          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.loadAllReserveData();
          this.dataLoaderService.loadUserSpecificData();
        }
        else {
          // show proper failed notification
          this.showFailedActionNotification(modalAction, assetAction);
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (e.includes('Pending')) {
          setTimeout(this.processIconexTransactionResult.bind(this, payload), 2000);
        } else {
          log.debug("Error in isTxConfirmed:", e);
          throw new OmmError(e.message);
        }
      });
    } else  {
      throw new OmmError("ICON RPC ERROR: " + payload.error?.message);
    }
  }

  public processBridgeTransactionResult(event: any): void {
    const {txHash, error, status} = event.detail;

    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction();
    const assetAction = modalAction.assetAction!;

    // success
    if (status === 1) {
      // show proper success notification
      this.showSuccessActionNotification(modalAction, assetAction);

      // reload all reserves and user asset-user reserve data
      this.dataLoaderService.loadAllReserveData();
      this.dataLoaderService.loadUserSpecificData();
    }
    else {
      log.debug("Bridge: transaction failed, details:", error);
      // show proper failed notification
      this.showFailedActionNotification(modalAction, assetAction);
    }
  }

  private showSuccessActionNotification(modalAction: ModalAction, assetAction: AssetAction): void {
    switch (modalAction.modalType) {
      case Modals.SUPPLY:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} supplied.`);
        break;
      case Modals.WITHDRAW:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} withdrawn.`);
        break;
      case Modals.BORROW:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} borrowed.`);
        break;
      case Modals.REPAY:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} repaid.`);
        break;
    }
  }

  private showFailedActionNotification(modalAction: ModalAction, assetAction: AssetAction): void {
    switch (modalAction.modalType) {
      case Modals.SUPPLY:
        this.notificationService.showNewNotification(`Couldn't supply ${assetAction.asset.tag}. Try again.`);
        break;
      case Modals.WITHDRAW:
        this.notificationService.showNewNotification(`Couldn't withdraw ${assetAction.asset.tag}. Try again.`);
        break;
      case Modals.BORROW:
        this.notificationService.showNewNotification(`Couldn't borrow ${assetAction.asset.tag}. Try again.`);
        break;
      case Modals.REPAY:
        this.notificationService.showNewNotification(`Couldn't repay ${assetAction.asset.tag}. Try again.`);
        break;
    }
  }
}
