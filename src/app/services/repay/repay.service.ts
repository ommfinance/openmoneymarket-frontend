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
import {ScoreService} from "../score/score.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {ModalAction} from "../../models/ModalAction";

@Injectable({
  providedIn: 'root'
})
export class RepayService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService,
              private scoreService: ScoreService,
              private localStorageService: LocalStorageService) {
  }

  public repayAsset(modalAction: ModalAction, assetTag: AssetTag, notificationMessage: string): void {
    let amount = modalAction.assetAction!.amount
    amount = Utils.convertIfICXTosICX(amount, this.persistenceService.getAssetReserveData(AssetTag.ICX)!.sICXRate, assetTag);
    amount = Utils.roundDownTo2Decimals(amount);

    // fetch users debt amount from SCORE
    this.getUserDebt(assetTag, amount).then((debt: number) => {
      // round up debt to 2 decimals in order to try to avoid the dust
      debt = Utils.roundUpTo2Decimals(debt)
      log.debug("debt being repaid = " + debt)

      // store updated amount (debt) in localstorage
      modalAction.assetAction!.amount = debt
      this.localStorageService.persistModalAction(modalAction);

      // build repay tx
      const tx = this.buildRepayAssetTx(debt, assetTag);

      log.debug(`repay ${assetTag} TX: `, tx);
      this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
    });
  }

  public getUserDebt(assetTag: AssetTag, amount: number): Promise<number> {
    return this.scoreService.getUserDebt(assetTag).then(res => {
      log.debug(`getUserDebt for ${assetTag} = ${res}`)
      return res;
    }).catch(e => {
      log.error("Error occurred in getUserDebt:");
      log.error(e);
      return amount
    })
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
