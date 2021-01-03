import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              private localStorageService: LocalStorageService) { }

  public processIconexTransactionResult(payload: IconJsonRpcResponse): void {
    log.debug("processTransactionResult->payload: ", payload);
    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).
      then((res: any) => {
        if (res.status === 1) {
          // Show success notification
          this.notificationService.showNewNotification("Success");

          log.debug("payload.id: ", payload.id);
          log.debug("res:", res);

          const assetAction = this.localStorageService.getAssetAction();
          if (!environment.production) {
            this.scoreService.getUserAssetBalance(assetAction.asset.tag).then(balance => {
              log.debug(`${assetAction.asset.tag} balance after ${IconexRequestsMap[payload.id]}: `, balance);
            });
          }
          switch (payload.id) {
            case IconexRequestsMap.SUPPLY:
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              this.notificationService.showNewNotification(`Successfully supplied ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.WITHDRAW:
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              this.notificationService.showNewNotification(`Successfully withdrawn ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.BORROW:
              // load all reserves and user specific asset reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              this.notificationService.showNewNotification(`Successfully borrowed ${assetAction.amount} ${assetAction.asset.tag}.`);
              break;
            case IconexRequestsMap.REPAY:
              // load all reserves and user specific asset reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              this.notificationService.showNewNotification(`Successfully repayed ${assetAction.amount} ${assetAction.asset.tag}.`);
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
      alert("ICON RPC ERROR: " + payload.error?.message);
    }
  }
}
