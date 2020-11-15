import { Injectable } from '@angular/core';
import {IconTransactionType} from '../../models/IconTransactionType';
import IconService, { IconAmount, IconConverter } from "icon-sdk-js";
import {IconApiService} from '../icon-api-service/icon-api.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {MockScoreService} from '../mock-score/mock-score.service';
import {IconWallet} from '../../models/IconWallet';
import {IconexApiService} from '../iconex-api/iconex-api.service';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {ScoreService} from "../score-service/score.service";


@Injectable({
  providedIn: 'root'
})
export class DepositService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private mockScoreService: MockScoreService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService) {
  }

  /* Deposit USDb flow:
   * 1. Ibriz will give AddressProvider SCORE address
   * 2. Call to AddressProvider SCORE -> getAllAddresses and extract USDb SCORE address (Bridge SCORE)
   * 3. Call USDb SCORE transfer in params to lending pool SCORE
   * Get reserve data for a specific reserve -> LendingPoolDataProvider SCORE (that will give USDb reserve information)
   * Once the user does the deposit -> LendingPoolDataProvider -> get user reserve data for specific user and get user all reserve data
   *
   */
  public depositUSDb(amount: number): void {
    if (this.persistenceService.iconexWallet == null) {
      alert("Please connect your Iconex wallet!");
      return;
    }

    this.transferUSDbTokenToLendingPool(amount, this.persistenceService.iconexWallet);
  }

  private transferUSDbTokenToLendingPool(amount: number, wallet: IconWallet): void {
    if (!this.persistenceService.allAddresses) {
      alert("SCORE all addresses not loaded!");
      return;
    }
    // TODO: refactor for Bridge
    const params = {
      _to: this.persistenceService.allAddresses.systemContract.LendingPool,
      _value: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _data: IconConverter.fromUtf8('{ "method": "deposit", "params": { "amount":' + IconAmount.of(amount, IconAmount.Unit.ICX).toLoop() + '}}')
};

    const tx = this.iconApiService.buildTransaction(wallet.address,  this.persistenceService.allAddresses.collateral.USDb,
      ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    console.log("TX: ", tx);
    this.scoreService.getUserBalanceOfUSDb().then(res => {
      console.log("USDb balance before: ", res);
    });

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.DEPOSIT_USDb);
  }

}
