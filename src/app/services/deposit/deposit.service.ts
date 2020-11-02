import { Injectable } from '@angular/core';
import {IconTransactionType} from '../../models/IconTransactionType';
import IconService, { IconBuilder, IconAmount, IconConverter, SignedTransaction } from "icon-sdk-js";
import {IconApiService} from '../icon-api-service/icon-api.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {MockScoreService} from '../mock-score/mock-score.service';
import {Constants} from '../../common/constants';
import {IconWallet} from '../../models/IconWallet';
import {IconexApiService} from '../iconex-api/iconex-api.service';
import {IconexRequestsMap} from '../../common/iconex-requests-map';


@Injectable({
  providedIn: 'root'
})
export class DepositService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private mockScoreService: MockScoreService,
              private iconexApiService: IconexApiService) {
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
    // TODO: refactor for Bridge
    const params = {
      _to: this.persistenceService.lendingPoolScoreAddress,
      _value: IconConverter.toHex(amount)
    };

    const tx = this.iconApiService.buildTransaction(wallet.address,  this.persistenceService.USDbScoreAddress,
      ScoreMethodNames.TRANSFER, params, IconTransactionType.READ);

    console.log("TX: ", tx);
    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.DEPOSIT_USDb);
    this.mockScoreService.depositUSDbStateChange(amount);
  }

}
