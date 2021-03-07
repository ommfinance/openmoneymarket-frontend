import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {NotificationService} from "../notification/notification.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {ModalAction} from "../../models/ModalAction";
import {AssetAction} from "../../models/AssetAction";
import {ModalType} from "../../models/ModalType";

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

  public processIconexTransactionResult(payload: IconJsonRpcResponse, maxRetry: number = 5): void {
    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction();
    const assetAction: AssetAction = modalAction.assetAction!;

    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).then(res => {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        // success
        if (res.status === 1) {
          // show proper success notification
          this.showSuccessActionNotification(modalAction, assetAction);
        } else {
          // show proper failed notification
          this.showFailedActionNotification(modalAction, assetAction);
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (maxRetry > 0) {
          setTimeout( () => this.processIconexTransactionResult(payload, maxRetry - 1), 2200);
        } else {
          log.debug("Error in isTxConfirmed:", e);
          this.showFailedActionNotification(modalAction, assetAction);
          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.afterUserActionReload();
        }
      });
    } else  {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      log.error(`ICON RPC ERROR details:`);
      log.error(payload);
      this.showFailedActionNotification(modalAction, assetAction);
    }
  }

  processIconTransactionResult(txHash: string, maxRetry: number = 5): void {
    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction();
    const assetAction: AssetAction = modalAction.assetAction!;

    this.iconApiService.getTxResult(txHash).then((res: any) => {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      // success
      if (res.status === 1) {
        // show proper success notification
        this.showSuccessActionNotification(modalAction, assetAction);
      } else {
        // show proper failed notification
        this.showFailedActionNotification(modalAction, assetAction);
        log.debug("Transaction failed! Details: ", res);
      }
    }).catch(e => {
      if (maxRetry > 0) {
        setTimeout(() => this.processIconTransactionResult(txHash, maxRetry - 1), 2200);
      } else {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        log.debug("Error in isTxConfirmed:", e);
        this.showFailedActionNotification(modalAction, assetAction);
      }
    });
  }

  public processBridgeTransactionResult(event: any): void {
    const {txHash, error, status} = event.detail;

    // reload all reserves and user specific data (reserve, account data, ..)
    this.dataLoaderService.afterUserActionReload();

    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction();
    const assetAction = modalAction.assetAction!;

    // success
    if (status === 1) {
      // show proper success notification
      this.showSuccessActionNotification(modalAction, assetAction);
    }
    else {
      log.debug("Bridge: transaction failed, details:", error);
      // show proper failed notification
      this.showFailedActionNotification(modalAction, assetAction);
    }
  }

  private showSuccessActionNotification(modalAction: ModalAction, assetAction: AssetAction): void {
    switch (modalAction.modalType) {
      case ModalType.SUPPLY:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} supplied.`);
        break;
      case ModalType.WITHDRAW:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} withdrawn.`);
        break;
      case ModalType.BORROW:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} borrowed.`);
        break;
      case ModalType.REPAY:
        this.notificationService.showNewNotification(`${assetAction.amount} ${assetAction.asset.tag} repaid.`);
        break;
      case ModalType.CLAIM_OMM_REWARDS:
        this.notificationService.showNewNotification(`${assetAction.amount} Omm Tokens claimed.`);
    }
  }

  private showFailedActionNotification(modalAction: ModalAction, assetAction: AssetAction): void {
    switch (modalAction.modalType) {
      case ModalType.SUPPLY:
        this.notificationService.showNewNotification(`Couldn't supply ${assetAction.asset.tag}. Try again.`);
        break;
      case ModalType.WITHDRAW:
        this.notificationService.showNewNotification(`Couldn't withdraw ${assetAction.asset.tag}. Try again.`);
        break;
      case ModalType.BORROW:
        this.notificationService.showNewNotification(`Couldn't borrow ${assetAction.asset.tag}. Try again.`);
        break;
      case ModalType.REPAY:
        this.notificationService.showNewNotification(`Couldn't repay ${assetAction.asset.tag}. Try again.`);
        break;
      case ModalType.CLAIM_OMM_REWARDS:
        this.notificationService.showNewNotification("Couldn't claim Omm Tokens. Try again.");
    }
  }
}
