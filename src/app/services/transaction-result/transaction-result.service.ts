import { Injectable } from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {NotificationService} from "../notification/notification.service";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService) { }

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
          switch (payload.id) {
            case IconexRequestsMap.DEPOSIT_USDb:
              this.scoreService.getUserBalanceOfUSDb().then(res => {
                log.debug("USDb balance after deposit: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful deposit of USDb!");
              break;
            case IconexRequestsMap.WITHDRAW_USDb:
              this.scoreService.getUserBalanceOfUSDb().then(res => {
                log.debug("USDb balance after withdraw: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful withdraw of USDb!");
              break;
            case IconexRequestsMap.BORROW_USDb:
              log.debug("IconexRequestsMap.BORROW_USDb");
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful borrow of USDb!");
              break;
            case IconexRequestsMap.REPAY_USDb:
              log.debug("IconexRequestsMap.REPAY_USDb");
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful repay of USDb!");
              break;
            case IconexRequestsMap.DEPOSIT_ICX:
              this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address).then(res => {
                log.debug("ICX balance after deposit: ", res);
              });
              // load all reserves and user specific ICX reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful deposit of ICX!");
              break;
            case IconexRequestsMap.WITHDRAW_ICX:
              this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address).then(res => {
                log.debug("ICX balance after withdraw: ", res);
              });
              // load all reserves and user specific ICX reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful withdraw of ICX!");
              break;
            case IconexRequestsMap.BORROW_ICX:
              log.debug("IconexRequestsMap.BORROW_ICX");
              // load all reserves and user specific ICX reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful borrow of ICX!");
              break;
            case IconexRequestsMap.REPAY_ICX:
              log.debug("IconexRequestsMap.REPAY_ICX");
              // load all reserves and user specific ICX reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful repay of ICX!");
              break;
            default:
              break;
          }
        } else {
          // Show error notification TODO get error styling?
          this.notificationService.showNewNotification("Transaction failed! Details: " +  String(res));
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
