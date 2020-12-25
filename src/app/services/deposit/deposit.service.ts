import { Injectable } from '@angular/core';
import {IconTransactionType} from '../../models/IconTransactionType';
import IconService, { IconAmount, IconConverter } from "icon-sdk-js";
import {IconApiService} from '../icon-api/icon-api.service';
import {PersistenceService} from '../persistence/persistence.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {IconexWallet} from '../../models/IconexWallet';
import {IconexApiService} from '../iconex-api/iconex-api.service';
import {IconexRequestsMap} from '../../common/iconex-requests-map';
import {ScoreService} from "../score/score.service";
import {Utils} from "../../common/utils";
import {CheckerService} from "../checker/checker.service";
import log from "loglevel";


@Injectable({
  providedIn: 'root'
})
export class DepositService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService,
              private checkerService: CheckerService) {
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
    if (this.persistenceService.activeWallet == null) {
      alert("Please connect your Iconex wallet!");
      return;
    }

    this.transferUSDbTokenToLendingPool(amount, this.persistenceService.activeWallet);
  }

  private transferUSDbTokenToLendingPool(amount: number, wallet: IconexWallet): void {
    log.debug("Deposit USDb amount = " + amount);
    if (!this.persistenceService.allAddresses) {
      alert("SCORE all addresses not loaded!");
      return;
    }
    // TODO: refactor for Bridge
    const params = {
      _to: this.persistenceService.allAddresses.systemContract.LendingPool,
      _value: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _data: IconConverter.fromUtf8('{ "method": "deposit", "params": { "amount":' + Utils.amountToe18MultipliedString(amount) + '}}')
};
    log.debug("Deposit USDb params amount = " +  Utils.amountToe18MultipliedString(amount));

    const tx = this.iconApiService.buildTransaction(wallet.address,  this.persistenceService.allAddresses.collateral.USDb,
      ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    log.debug("TX: ", tx);
    this.scoreService.getUserBalanceOfUSDb().then(res => {
      log.debug("USDb balance before: ", res);
    });

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.DEPOSIT_USDb);
  }

  public depositIcxToLendingPool(amount: number): void {
    log.debug("Deposit ICX amount = " + amount);
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,  this.persistenceService.allAddresses!.systemContract.LendingPool,
      ScoreMethodNames.DEPOSIT, params, IconTransactionType.WRITE, amount);

    log.debug("TX: ", tx);
    this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address).then(res => {
      log.debug("ICX balance before: ", res);
    });

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.DEPOSIT_ICX);
  }

}
