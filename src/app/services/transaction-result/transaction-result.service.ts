import { Injectable } from '@angular/core';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {Utils} from '../../common/utils';
import {IconApiService} from '../icon-api/icon-api.service';
import {IconJsonRpcResponse} from '../../interfaces/icon-json-rpc-response';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {AllReserves} from "../../interfaces/all-reserves";
import {Mapper} from "../../common/mapper";
import {Reserve} from "../../interfaces/reserve";
import {DataLoaderService} from "../data-loader/data-loader.service";
import {BorrowService} from "../borrow/borrow.service";

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
              alert("Successful deposit of USDb!");
              break;
            case IconexRequestsMap.WITHDRAW_USDb:
              this.scoreService.getUserBalanceOfUSDb().then(res => {
                console.log("USDb balance after withdraw: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful withdraw of USDb!");
              break;
            case IconexRequestsMap.BORROW_USDb:
              console.log("IconexRequestsMap.BORROW_USDb");
              // load all reserves and user specific USDb reserve data
              // this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful borrow of USDb!");
              break;
            case IconexRequestsMap.REPAY_USDb:
              console.log("IconexRequestsMap.REPAY_USDb");
              // load all reserves and user specific USDb reserve data
              // this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserUSDbReserveData();
              alert("Successful repay of USDb!");
              break;
            case IconexRequestsMap.DEPOSIT_ICX:
              this.iconApiService.getIcxBalance(this.persistenceService.iconexWallet!.address).then(res => {
                console.log("ICX balance after deposit: ", res);
              });
              // load all reserves and user specific USDb reserve data
              this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful deposit of ICX!");
              break;
            case IconexRequestsMap.BORROW_ICX:
              console.log("IconexRequestsMap.BORROW_ICX");
              // load all reserves and user specific ICX reserve data
              // this.dataLoaderService.loadAllReserves();
              this.dataLoaderService.loadUserIcxReserveData();
              alert("Successful borrow of ICX!");
              break;
            default:
              break;
          }
        } else {
          alert("Transaction failed! Details: " +  String(res));
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
