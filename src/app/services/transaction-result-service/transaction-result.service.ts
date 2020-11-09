import { Injectable } from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {Utils} from '../../common/utils';
import {IconApiService} from '../icon-api-service/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score-service/score.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {AllReserves} from "../../interfaces/AllReserves";
import {Mapper} from "../../common/mapper";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private scoreService: ScoreService,
              private persistenceService: PersistenceService) { }

  public processIconexTransactionResult(payload: IconJsonRpcResponse): void {
    console.log("processTransactionResult->payload: ", payload);
    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).
      then((res: any) => {
        if (res.status === 1) {
          this.scoreService.getUserBalanceOfUSDb().then(res => {
            console.log("USDb balance after: ", res);
          });
          console.log("payload.id: ",payload.id);
          console.log("res:", res);
          switch (payload.id) {
            case IconexRequestsMap.DEPOSIT_USDb:
              // TODO: handle what happens after deposited USDb
              // Get reserve data for a specific reserve -> LendingPoolDataProvider SCORE (that will give USDb reserve information)
              // After deposit->LendingPoolDataProvider->get user reserve data for specific user and get user all reserve data
              const amount: number = Utils.ixcValueToNormalisedValue(res.eventLogs[0].indexed[3]);
              console.log("processTransactionResult -> Amount deposited:", amount);

              this.scoreService.getReserveDataForAllReserves().then((res: AllReserves) => {
                this.persistenceService.allReserves = Mapper.mapAllReserves(res);
                console.log("getReserveDataForAllReserves", res);
              });

              this.scoreService.getUserReserveDataForAllReserves().then(res => console.log("getUserReserveDataForAllReserves", res));

              this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses?.collateral.USDb)
                .then(res => console.log("getUserReserveDataForSpecificReserve", res));

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
