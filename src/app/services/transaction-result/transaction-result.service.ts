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
    log.debug("processTransactionResult->payload: ", payload);
    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).
      then((res: any) => {
        if (res.status === 1) {
          log.debug("payload.id: ", payload.id);
          log.debug("res:", res);

          const modalAction: ModalAction = this.localStorageService.getLastModalAction();
          const assetAction: AssetAction = modalAction.assetAction!;
          if (!environment.production) {
            this.scoreService.getUserAssetBalance(assetAction.asset.tag).then(balance => {
              log.debug(`${assetAction.asset.tag} balance after ${IconexRequestsMap[payload.id]}: `, balance);
            });
          }

          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.loadAllReserveData();
          this.dataLoaderService.loadUserSpecificData();

          switch (payload.id) {
            case IconexRequestsMap.SUPPLY:
              this.notificationService.showNewNotification(`Successfully supplied ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.WITHDRAW:

              this.notificationService.showNewNotification(`Successfully withdraw ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.BORROW:
              this.notificationService.showNewNotification(`Successfully borrowed ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.REPAY:
              this.notificationService.showNewNotification(`Successfully repaid ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            default:
              break;
          }
        } else {
          // Show error notification TODO get error styling?
          this.notificationService.showNewNotification("Transaction failed! Message: " +  String(res.failure.message));
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        log.debug("catch->e:", e);
        if (e.includes('Pending')) {
          setTimeout(this.processIconexTransactionResult.bind(this, payload), 2000);
        } else {
          log.debug("Error in isTxConfirmed:", e);
          throw new Error(e.message);
        }
      });
    } else  {
      throw new OmmError("ICON RPC ERROR: " + payload.error?.message);
    }
  }

  public processBridgeTransactionResult(event: any): void {
    const {txHash, error, status} = event.detail;
    if (status !== 1) {
      throw new OmmError(error);
    } else {

      const modalAction: ModalAction = this.localStorageService.getLastModalAction();
      const assetAction = modalAction.assetAction!;

      if (!environment.production) {
        this.scoreService.getUserAssetBalance(assetAction.asset.tag).then(balance => {
          log.debug(`${assetAction.asset.tag} balance after ${modalAction.modalType.valueOf()}: `, balance);
        });
      }

      // reload all reserves and user asset-user reserve data
      this.dataLoaderService.loadAllReserveData();
      this.dataLoaderService.loadUserSpecificData();

      switch (modalAction.modalType) {
        case Modals.SUPPLY:
          this.notificationService.showNewNotification(`Successfully supplied ${assetAction.amount} ${assetAction.asset.tag}.`);
          break;
        case Modals.WITHDRAW:
          this.notificationService.showNewNotification(`Successfully withdraw ${assetAction.amount} ${assetAction.asset.tag}.`);
          break;
        case Modals.BORROW:
          this.notificationService.showNewNotification(`Successfully borrowed ${assetAction.amount} ${assetAction.asset.tag}.`);
          break;
        case Modals.REPAY:
          this.notificationService.showNewNotification(`Successfully repaid ${assetAction.amount} ${assetAction.asset.tag}.`);
          break;
        default:
          break;
      }
    }
  }
}
