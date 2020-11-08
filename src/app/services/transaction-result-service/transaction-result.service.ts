import { Injectable } from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {Utils} from '../../common/utils';
import {IconApiService} from '../icon-api-service/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score-service/score.service';
import {PersistenceService} from '../persistence-service/persistence.service';

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
      const {confirmed, result} = this.iconApiService.isTxConfirmed(payload.result);
      if (confirmed) {
        switch (payload.id) {
          case IconexRequestsMap.DEPOSIT_USDb:
            // TODO: handle what happens after deposited USDb
            // Get reserve data for a specific reserve -> LendingPoolDataProvider SCORE (that will give USDb reserve information)
            // After deposit->LendingPoolDataProvider->get user reserve data for specific user and get user all reserve data
            const amount: number = Utils.ixcValueToNormalisedValue(result.eventLogs.indexed[3]);
            console.log("processTransactionResult -> Amount deposited:", amount);

            this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses?.collateral.USDb);
        }
      }
    } else  {
      alert("ICON RPC ERROR: " + payload.error?.message);
    }
  }
}
