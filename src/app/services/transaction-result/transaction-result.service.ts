import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {NotificationService} from "../notification/notification.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {ModalAction, ModalActionsResult, ModalStatus} from "../../models/ModalAction";
import {ModalType} from "../../models/ModalType";
import {StateChangeService} from "../state-change/state-change.service";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              private localStorageService: LocalStorageService,
              private stateChangeService: StateChangeService) {
    window.addEventListener("bri.tx.result", (e) => this.processBridgeTransactionResult(e));
  }

  public processIconexTransactionResult(payload: IconJsonRpcResponse, maxRetry: number = 5): void {
    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction()!!;

    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).then(res => {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        // success
        if (res.status === 1) {
          // show proper success notification
          this.showSuccessActionNotification(modalAction);
        } else {
          // show proper failed notification
          this.showFailedActionNotification(modalAction);
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (maxRetry > 0) {
          setTimeout( () => this.processIconexTransactionResult(payload, maxRetry - 1), 2200);
        } else {
          log.debug("Error in isTxConfirmed:", e);
          this.showFailedActionNotification(modalAction);
          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.afterUserActionReload();
        }
      });
    } else  {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      log.error(`ICON RPC ERROR details:`);
      log.error(payload);
      this.showFailedActionNotification(modalAction);
    }
  }

  processIconTransactionResult(txHash: string, maxRetry: number = 5): void {
    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction()!!;

    this.iconApiService.getTxResult(txHash).then((res: any) => {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      // success
      if (res.status === 1) {
        // show proper success notification
        this.showSuccessActionNotification(modalAction);
      } else {
        // show proper failed notification
        this.showFailedActionNotification(modalAction);
        log.debug("Transaction failed! Details: ", res);
      }
    }).catch(e => {
      if (maxRetry > 0) {
        setTimeout(() => this.processIconTransactionResult(txHash, maxRetry - 1), 2200);
      } else {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        log.debug("Error in isTxConfirmed:", e);
        this.showFailedActionNotification(modalAction);
      }
    });
  }

  public processBridgeTransactionResult(event: any): void {
    const {txHash, error, status} = event.detail;

    // reload all reserves and user specific data (reserve, account data, ..)
    this.dataLoaderService.afterUserActionReload();

    // get last modal action from localstorage
    const modalAction: ModalAction = this.localStorageService.getLastModalAction()!!;

    // success
    if (status === 1) {
      // show proper success notification
      this.showSuccessActionNotification(modalAction);
    }
    else {
      log.debug("Bridge: transaction failed, details:", error);
      // show proper failed notification
      this.showFailedActionNotification(modalAction);
    }
  }

  public showSuccessActionNotification(modalAction: ModalAction): void {
    this.stateChangeService.userModalActionResult.next(new ModalActionsResult(modalAction, ModalStatus.SUCCESS));

    if (modalAction.assetAction) {
      const assetAction = modalAction.assetAction;
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
    } else if (modalAction.stakingAction) {
      const voteAction = modalAction.stakingAction;
      switch (modalAction.modalType) {
        case ModalType.STAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(`${voteAction.amount} OMM staked.`);
          break;
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(`${voteAction.amount} OMM unstaking.`);
          break;
      }
    } else if (modalAction.voteAction) {
      switch (modalAction.modalType) {
        case ModalType.UPDATE_PREP_SELECTION:
          this.notificationService.showNewNotification(`Votes allocated.`);
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.notificationService.showNewNotification(`Votes removed.`);
          break;
      }
    }
  }

  public showFailedActionNotification(modalAction?: ModalAction): void {
    if (!modalAction) {
      return;
    }

    this.stateChangeService.userModalActionResult.next(new ModalActionsResult(modalAction, ModalStatus.FAILED));

    if (modalAction.assetAction) {
      const assetAction = modalAction.assetAction;
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
    } else if (modalAction.stakingAction) {
      switch (modalAction.modalType) {
        case ModalType.STAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(`Couldn't stake Omm Tokens. Try again.`);
          break;
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(`Couldn't unstake Omm Tokens. Try again.`);
          break;
      }
    } else if (modalAction.voteAction) {
      switch (modalAction.modalType) {
        case ModalType.UPDATE_PREP_SELECTION:
          this.notificationService.showNewNotification(`Couldn't allocate your votes. Try again.`);
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.notificationService.showNewNotification(`Couldn't remove your votes. Try again.`);
          break;
      }
    }

  }
}
