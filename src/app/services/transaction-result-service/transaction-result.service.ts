import { Injectable } from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {Utils} from '../../common/utils';
import {IconApiService} from '../icon-api-service/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score-service/score.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {AllReserves} from "../../interfaces/all-reserves";
import {Mapper} from "../../common/mapper";
import {UserUSDbReserve} from "../../interfaces/user-usdb-reserve";
import {DataLoaderService} from "../data-loader-service/data-loader.service";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService) { }

  public processIconexTransactionResult(payload: IconJsonRpcResponse): void {
    console.log("processTransactionResult->payload: ", payload);
    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).
      then((res: any) => {
        if (res.status === 1) {
          console.log("payload.id: ", payload.id);
          console.log("res:", res);
          switch (payload.id) {
            case IconexRequestsMap.DEPOSIT_USDb:
              this.scoreService.getUserBalanceOfUSDb().then(res => {
                console.log("USDb balance after deposit: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              break;
            case IconexRequestsMap.WITHDRAW_USDb:
              this.scoreService.getUserBalanceOfUSDb().then(res => {
                console.log("USDb balance after withdraw: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              break;
            case IconexRequestsMap.BORROW_USDb:
              console.log("IconexRequestsMap.BORROW_USDb");
              break;
            default:
              break;
          }
        } else {
          console.log("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        console.log("catch->e:", e);
        if (e.includes('Pending')) {
          setTimeout(this.processIconexTransactionResult.bind(this, payload), 2000);
        } else {
          console.log("Error in isTxConfirmed:", e);
          throw new Error(e.message);
        }
      });
    } else  {
      alert("ICON RPC ERROR: " + payload.error?.message);
    }
  }
}
