import {Injectable} from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {ScoreService} from "../score/score.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {CheckerService} from "../checker/checker.service";
import log from "loglevel";
import {AssetTag} from "../../models/Asset";
import {Utils} from "../../common/utils";
import {TransactionDispatcherService} from "../transaction-dispatcher/transaction-dispatcher.service";

@Injectable({
  providedIn: 'root'
})
export class WithdrawService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService) {
  }

  public withdrawAsset(amount: number, assetTag: AssetTag, waitForUnstaking = false, notificationMessage: string): void {
    let tx;

    switch (assetTag) {
      case AssetTag.ICX:
        tx = this.buildWithdrawIcxTx(amount, waitForUnstaking);
        break;
      case AssetTag.USDb:
        tx = this.buildWithdrawUSDbTx(amount);
        break;
    }

    log.debug(`withdraw ${assetTag} TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  private buildWithdrawUSDbTx(amount: number): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oUSDb, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);
  }

  private buildWithdrawIcxTx(amount: number, waitForUnstaking = false): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    // convert amount from ICX value to sICX
    log.debug("Withdraw amount before conversion to sICX = " + amount);
    amount = Utils.convertICXValueTosICX(amount, this.persistenceService.getAssetReserveData(AssetTag.ICX)!.sICXRate);
    log.debug("Withdraw amount after conversion to sICX = " + amount);

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _waitForUnstaking: waitForUnstaking ? "0x1" : "0x0"
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oICX, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);
  }
}
