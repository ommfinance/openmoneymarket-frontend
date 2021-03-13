import {Injectable} from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {CheckerService} from "../checker/checker.service";
import log from "loglevel";
import {AssetTag} from "../../models/Asset";
import {BridgeWidgetService} from "../bridge-widget/bridge-widget.service";
import {TransactionDispatcherService} from "../transaction-dispatcher/transaction-dispatcher.service";
import {Utils} from "../../common/utils";

@Injectable({
  providedIn: 'root'
})
export class BorrowService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private bridgeWidgetService: BridgeWidgetService,
              private transactionDispatcherService: TransactionDispatcherService) {
  }

  public borrowAsset(amount: number, assetTag: AssetTag, notificationMessage: string): void {
    amount = Utils.roundDownTo2Decimals(amount);
    const tx = this.buildBorrowAssetTx(amount, assetTag);

    log.debug(`borrow ${assetTag} TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  private buildBorrowAssetTx(amount: number, assetTag: AssetTag): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    amount = Utils.convertIfICXTosICX(amount, this.persistenceService.getAssetReserveData(AssetTag.ICX)!.sICXRate, assetTag);

    const decimals = this.persistenceService.allReserves!.getReserveData(assetTag).decimals;

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
      _reserve: this.persistenceService.allAddresses!.collateralAddress(assetTag)
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.BORROW, params, IconTransactionType.WRITE);
  }

}
