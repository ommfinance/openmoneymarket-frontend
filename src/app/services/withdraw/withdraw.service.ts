import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {MockScoreService} from "../mock-score/mock-score.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {ScoreService} from "../score/score.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {IconexRequestsMap} from "../../common/iconex-requests-map";

@Injectable({
  providedIn: 'root'
})
export class WithdrawService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private mockScoreService: MockScoreService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService) {
  }

  public withdrawUSDb(amount: number) {
    if (!this.persistenceService.allAddresses || !this.persistenceService.iconexWallet) {
      alert("withdrawUSDb ->SCORE all addresses or icon wallet not loaded!");
      return;
    }
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.iconexWallet.address,  this.persistenceService.allAddresses.oTokens.oUSDb,
      ScoreMethodNames.WITHDRAW_USDB, params, IconTransactionType.WRITE);

    console.log("TX: ", tx);
    this.scoreService.getUserBalanceOfUSDb().then(res => {
      console.log("USDb balance before withdraw: ", res);
    });

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.WITHDRAW_USDb);
  }



}
