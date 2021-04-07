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
    if (amount !== -1) {
      amount = Utils.roundDownTo2Decimals(amount);
    }

    switch (assetTag) {
      case AssetTag.ICX:
        tx = this.buildWithdrawIcxTx(amount, waitForUnstaking);
        break;
      default:
        tx = this.buildWithdrawIrc2AssetTx(amount, assetTag);
    }

    log.debug(`Withdraw ${assetTag} TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  private buildWithdrawIrc2AssetTx(amount: number, assetTag: AssetTag): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    const decimals = this.persistenceService.allReserves!.getReserveData(assetTag).decimals;

    const params = {
      _amount: amount !== -1 ? IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()) : "-0x1",
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokenAddress(assetTag), ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);
  }

  private buildWithdrawIcxTx(amount: number, waitForUnstaking = false): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    if (amount !== -1) {
      // convert amount from ICX value to sICX
      log.debug("Withdraw amount before conversion to sICX = " + amount);
      amount = Utils.convertICXTosICX(amount, this.persistenceService.getAssetReserveData(AssetTag.ICX)!.sICXRate);
      log.debug("Withdraw amount after conversion to sICX = " + amount);
    }

    const params = {
      _amount: amount !== -1 ? IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()) : "-0x1",
      _waitForUnstaking: waitForUnstaking ? "0x1" : "0x0"
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oICX, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);
  }
}
