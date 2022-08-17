import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {NotificationService} from "../notification/notification.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {ModalAction, ModalActionsResult, ModalStatus} from "../../models/classes/ModalAction";
import {ModalType} from "../../models/enums/ModalType";
import {StateChangeService} from "../state-change/state-change.service";
import {Utils} from "../../common/utils";
import {BORROW_MAX_ERROR_REGEX} from "../../common/constants";
import {Router} from "@angular/router";
import {
  FAILURE_APPLY_BOMM_BOOST,
  FAILURE_ASSET_BORROWED,
  FAILURE_ASSET_REPAID,
  FAILURE_ASSET_SUPPLIED,
  FAILURE_ASSET_WITHDRAWN, FAILURE_BORROW_MAX,
  FAILURE_CAST_VOTE,
  FAILURE_CLAIM_AND_APPLY_BOMM_BOOST,
  FAILURE_CLAIM_ICX,
  FAILURE_CLAIM_OMM,
  FAILURE_INCREASE_LOCK_OMM,
  FAILURE_INCREASE_LOCK_TIME,
  FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT,
  FAILURE_LOCK_OMM,
  FAILURE_MANAGE_STAKED_OMM,
  FAILURE_REMOVE_ALL_VOTES,
  FAILURE_STAKE_LP,
  FAILURE_SUBMIT_PROPOSAL,
  FAILURE_UNSTAKE_LP,
  FAILURE_UNSTAKE_OMM,
  FAILURE_UPDATE_VOTES,
  FAILURE_WITHDRAW_LOCKED_OMM,
  SUCCESS_APPLY_BOMM_BOOST,
  SUCCESS_ASSET_BORROWED,
  SUCCESS_ASSET_REPAID,
  SUCCESS_ASSET_SUPPLIED,
  SUCCESS_ASSET_WITHDRAWN,
  SUCCESS_CAST_VOTE,
  SUCCESS_CLAIM_AND_APPLY_BOMM_BOOST,
  SUCCESS_CLAIM_ICX,
  SUCCESS_CLAIM_OMM,
  SUCCESS_INCREASE_LOCK_TIME,
  SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT,
  SUCCESS_INCREASE_LOCKED_OMM,
  SUCCESS_LOCK_OMM,
  SUCCESS_MIGRATE_STAKED_OMM,
  SUCCESS_REMOVE_VOTES,
  SUCCESS_STAKE_LP,
  SUCCESS_SUBMIT_PROPOSAL,
  SUCCESS_UNSTAKE_LP,
  SUCCESS_UNSTAKE_OMM,
  SUCCESS_UPDATE_VOTES,
  SUCCESS_WITHDRAW_LOCKED_OMM
} from "../../common/messages";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              private localStorageService: LocalStorageService,
              private stateChangeService: StateChangeService,
              private router: Router) {
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
          this.showFailedActionNotification(Utils.extractTxFailureMessage(res), modalAction);
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (maxRetry > 0) {
          setTimeout( () => this.processIconexTransactionResult(payload, maxRetry - 1), 2200);
        } else {
          log.debug("Error in isTxConfirmed:", e);
          this.showFailedActionNotification("Failed to confirm the transaction.", modalAction);
          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.afterUserActionReload();
        }
      });
    } else  {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      log.error(`ICON RPC ERROR details:`);
      log.error(payload);
      this.showFailedActionNotification(payload?.error?.message ?? "", modalAction);
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
        this.showFailedActionNotification(Utils.extractTxFailureMessage(res), modalAction);
        log.debug("Transaction failed! Details: ", res);
      }
    }).catch(e => {
      if (maxRetry > 0) {
        setTimeout(() => this.processIconTransactionResult(txHash, maxRetry - 1), 2200);
      } else {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        log.debug("Error in isTxConfirmed:", e);
        this.showFailedActionNotification("Failed to confirm the transaction.", modalAction);
      }
    });
  }

  public processBridgeTransactionResult(event: any): void {
    const { error, status } = event.detail;

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
      this.showFailedActionNotification("Error occurred in Bridge. Details: " + error ?? "", modalAction);
    }
  }

  public showSuccessActionNotification(modalAction: ModalAction): void {
    // hide oldest notification
    this.notificationService.hideOldest();

    this.stateChangeService.userModalActionResult.next(new ModalActionsResult(modalAction, ModalStatus.SUCCESS));

    if (modalAction.assetAction && modalAction.modalType !== ModalType.CLAIM_AND_APPLY_BOMM_BOOST
      && modalAction.modalType !== ModalType.APPLY_BOMM_BOOST) {
      const assetAction = modalAction.assetAction;
      assetAction.amount = assetAction.amount.dp(2);

      switch (modalAction.modalType) {
        case ModalType.SUPPLY:
          this.notificationService.showNewNotification(SUCCESS_ASSET_SUPPLIED(assetAction));
          break;
        case ModalType.WITHDRAW:
          this.notificationService.showNewNotification(SUCCESS_ASSET_WITHDRAWN(assetAction));
          break;
        case ModalType.BORROW:
          this.notificationService.showNewNotification(SUCCESS_ASSET_BORROWED(assetAction));
          break;
        case ModalType.REPAY:
          this.notificationService.showNewNotification(SUCCESS_ASSET_REPAID(assetAction));
          break;
        case ModalType.CLAIM_ICX:
          this.notificationService.showNewNotification(SUCCESS_CLAIM_ICX(assetAction));
          break;
        case ModalType.CLAIM_OMM_REWARDS:
          this.notificationService.showNewNotification(SUCCESS_CLAIM_OMM(assetAction));
          break;
        case ModalType.WITHDRAW_LOCKED_OMM:
          this.notificationService.showNewNotification(SUCCESS_WITHDRAW_LOCKED_OMM(assetAction));
          break;
      }
    } else if (modalAction.stakingAction) {
      const stakingAction = modalAction.stakingAction;
      stakingAction.amount = stakingAction.amount.dp(2);

      switch (modalAction.modalType) {
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(SUCCESS_UNSTAKE_OMM(stakingAction));
          break;
        case ModalType.POOL_STAKE:
          this.notificationService.showNewNotification(SUCCESS_STAKE_LP(stakingAction));
          break;
        case ModalType.POOL_UNSTAKE:
          this.notificationService.showNewNotification(SUCCESS_UNSTAKE_LP(stakingAction));
          break;
      }
    } else if (modalAction.voteAction) {
      switch (modalAction.modalType) {
        case ModalType.UPDATE_PREP_SELECTION:
          this.notificationService.showNewNotification(SUCCESS_UPDATE_VOTES);
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.notificationService.showNewNotification(SUCCESS_REMOVE_VOTES);
          break;
      }
    } else if (modalAction.governanceAction) {
      switch (modalAction.modalType) {
        case ModalType.SUBMIT_PROPOSAL:
          this.router.navigate(['/vote']);
          this.notificationService.showNewNotification(SUCCESS_SUBMIT_PROPOSAL);
          break;
        case ModalType.CAST_VOTE:
          this.notificationService.showNewNotification(SUCCESS_CAST_VOTE);
          break;
      }
    } else if (modalAction.lockingOmmAction) {
      const lockingAction = modalAction.lockingOmmAction;

      switch (modalAction.modalType) {
        case ModalType.LOCK_OMM:
          this.notificationService.showNewNotification(SUCCESS_LOCK_OMM(lockingAction));
          break;
        case ModalType.INCREASE_LOCK_TIME:
          this.notificationService.showNewNotification(SUCCESS_INCREASE_LOCK_TIME(lockingAction));
          break;
        case ModalType.INCREASE_LOCK_OMM:
          this.notificationService.showNewNotification(SUCCESS_INCREASE_LOCKED_OMM(lockingAction));
          break;
        case ModalType.INCREASE_LOCK_TIME_AND_AMOUNT:
          this.notificationService.showNewNotification(SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT(lockingAction));
          break;
      }

      // emit event indicating that locked action succeeded
      this.stateChangeService.lockedOmmActionSucceededUpdate(true);

    } else if (modalAction.manageStakedIcxAction) {
      const mngStkIcxAction = modalAction.manageStakedIcxAction;
      if (ModalType.MANAGE_STAKED_OMM === modalAction.modalType) {
        this.notificationService.showNewNotification(SUCCESS_MIGRATE_STAKED_OMM(mngStkIcxAction));
      } else if (ModalType.UNSTAKE_OMM_TOKENS === modalAction.modalType) {
        this.notificationService.showNewNotification(SUCCESS_UNSTAKE_OMM(mngStkIcxAction));
      }
    } else if (modalAction.modalType === ModalType.CLAIM_AND_APPLY_BOMM_BOOST) {
      const ommClaimed = modalAction.assetAction?.details?.ommRewards?.total ?? 0;
      this.notificationService.showNewNotification(SUCCESS_CLAIM_AND_APPLY_BOMM_BOOST(ommClaimed));
    } else if (modalAction.modalType !== ModalType.APPLY_BOMM_BOOST) {
      this.notificationService.showNewNotification(SUCCESS_APPLY_BOMM_BOOST);
    }
  }

  public showFailedActionNotification(failedTxMessage: string, modalAction?: ModalAction): void {
    // hide oldest notification
    this.notificationService.hideOldest();

    if (!modalAction) {
      return;
    }

    // handle Borrow max error
    if ((BORROW_MAX_ERROR_REGEX).test(failedTxMessage.toLowerCase())) {
      this.notificationService.showNewNotification(FAILURE_BORROW_MAX);
      return;
    }

    this.stateChangeService.userModalActionResult.next(new ModalActionsResult(modalAction, ModalStatus.FAILED));

    if (modalAction.assetAction && ModalType.CLAIM_AND_APPLY_BOMM_BOOST !== modalAction.modalType
      && ModalType.APPLY_BOMM_BOOST !== modalAction.modalType) {
      const assetAction = modalAction.assetAction;
      switch (modalAction.modalType) {
        case ModalType.SUPPLY:
          this.notificationService.showNewNotification(FAILURE_ASSET_SUPPLIED(assetAction, failedTxMessage));
          break;
        case ModalType.WITHDRAW:
          this.notificationService.showNewNotification(FAILURE_ASSET_WITHDRAWN(assetAction, failedTxMessage));
          break;
        case ModalType.BORROW:
          this.notificationService.showNewNotification(FAILURE_ASSET_BORROWED(assetAction, failedTxMessage));
          break;
        case ModalType.REPAY:
          this.notificationService.showNewNotification(FAILURE_ASSET_REPAID(assetAction, failedTxMessage));
          break;
        case ModalType.CLAIM_ICX:
          this.notificationService.showNewNotification(FAILURE_CLAIM_ICX(failedTxMessage));
          break;
        case ModalType.CLAIM_OMM_REWARDS:
          this.notificationService.showNewNotification(FAILURE_CLAIM_OMM(failedTxMessage));
          break;
        case ModalType.WITHDRAW_LOCKED_OMM:
          this.notificationService.showNewNotification(FAILURE_WITHDRAW_LOCKED_OMM(failedTxMessage));
          break;
      }
    } else if (modalAction.modalType === ModalType.CLAIM_AND_APPLY_BOMM_BOOST) {
      this.notificationService.showNewNotification(FAILURE_CLAIM_AND_APPLY_BOMM_BOOST);
    } else if (ModalType.APPLY_BOMM_BOOST === modalAction.modalType) {
      this.notificationService.showNewNotification(FAILURE_APPLY_BOMM_BOOST);
    } else if (modalAction.stakingAction) {
      switch (modalAction.modalType) {
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.notificationService.showNewNotification(FAILURE_UNSTAKE_OMM(failedTxMessage));
          break;
        case ModalType.POOL_STAKE:
          this.notificationService.showNewNotification(FAILURE_STAKE_LP(failedTxMessage));
          break;
        case ModalType.POOL_UNSTAKE:
          this.notificationService.showNewNotification(FAILURE_UNSTAKE_LP(failedTxMessage));
          break;
      }
    } else if (modalAction.voteAction) {
      switch (modalAction.modalType) {
        case ModalType.UPDATE_PREP_SELECTION:
          this.notificationService.showNewNotification(FAILURE_UPDATE_VOTES(failedTxMessage));
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.notificationService.showNewNotification(FAILURE_REMOVE_ALL_VOTES(failedTxMessage));
          break;
      }
    } else if (modalAction.governanceAction) {
      switch (modalAction.modalType) {
        case ModalType.SUBMIT_PROPOSAL:
          this.notificationService.showNewNotification(FAILURE_SUBMIT_PROPOSAL(failedTxMessage));
          break;
        case ModalType.CAST_VOTE:
          this.notificationService.showNewNotification(FAILURE_CAST_VOTE(failedTxMessage));
          break;
      }
    } else if (modalAction.lockingOmmAction) {
      switch (modalAction.modalType) {
        case ModalType.LOCK_OMM:
          this.notificationService.showNewNotification(FAILURE_LOCK_OMM(failedTxMessage));
          break;
        case ModalType.INCREASE_LOCK_TIME:
          this.notificationService.showNewNotification(FAILURE_INCREASE_LOCK_TIME(failedTxMessage));
          break;
        case ModalType.INCREASE_LOCK_OMM:
          this.notificationService.showNewNotification(FAILURE_INCREASE_LOCK_OMM(failedTxMessage));
          break;
        case ModalType.INCREASE_LOCK_TIME_AND_AMOUNT:
          this.notificationService.showNewNotification(FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT(failedTxMessage));
          break;
      }

      // emit event indicating that locked action succeeded
      this.stateChangeService.lockedOmmActionSucceededUpdate(false);
    } else if (modalAction.manageStakedIcxAction) {
      if (ModalType.MANAGE_STAKED_OMM === modalAction.modalType) {
        this.notificationService.showNewNotification(FAILURE_MANAGE_STAKED_OMM);
      } else if (ModalType.UNSTAKE_OMM_TOKENS === modalAction.modalType) {
        this.notificationService.showNewNotification(FAILURE_UNSTAKE_OMM(failedTxMessage));
      }
    }

  }
}
