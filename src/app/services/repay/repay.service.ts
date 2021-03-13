import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {Utils} from "../../common/utils";
import {CheckerService} from "../checker/checker.service";
import log from "loglevel";
import {AssetTag} from "../../models/Asset";
import {TransactionDispatcherService} from "../transaction-dispatcher/transaction-dispatcher.service";

@Injectable({
  providedIn: 'root'
})
export class RepayService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService) {
  }

  public repayAsset(amount: number, assetTag: AssetTag, notificationMessage: string): void {
    amount = Utils.convertIfICXTosICX(amount, this.persistenceService.getAssetReserveData(AssetTag.ICX)!.sICXRate, assetTag);
    amount = Utils.roundDownTo2Decimals(amount);
    const tx = this.buildRepayAssetTx(amount, assetTag);

    log.debug(`repay ${assetTag} TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  private buildRepayAssetTx(amount: number, assetTag: AssetTag): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    const decimals = this.persistenceService.allReserves!.getReserveData(assetTag).decimals;
    const amountString = Utils.normalisedAmountToBaseAmountString(amount, decimals);
    log.debug(`repay ${assetTag} amount = ${amount}, params amount = ${amountString}`);

    const to = this.persistenceService.allAddresses!.collateralAddress(assetTag);
    const data = `{"method": "repay", "params": {"_reserveAddress":"${to}" ,"amount":${amountString}}}`;

    const params = {
      _to: this.persistenceService.allAddresses!.systemContract.LendingPool,
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
      _data: IconConverter.fromUtf8(data)
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address, to,
      ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);
  }
}
