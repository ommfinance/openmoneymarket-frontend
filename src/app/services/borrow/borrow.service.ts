import {Injectable} from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {IconexRequestsMap} from "../../common/iconex-requests-map";
import {CheckerService} from "../checker/checker.service";
import log from "loglevel";
import {AssetTag} from "../../models/Asset";
import {IconexWallet} from "../../models/IconexWallet";
import {BridgeWallet} from "../../models/BridgeWallet";
import {BridgeWidgetService} from "../bridge-widget/bridge-widget.service";

@Injectable({
  providedIn: 'root'
})
export class BorrowService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private bridgeWidgetService: BridgeWidgetService) {
  }

  public borrowAsset(amount: number, assetTag: AssetTag): void {
    switch (assetTag) {
      case AssetTag.ICX:
        this.borrowIcx(amount);
        break;
      case AssetTag.USDb:
        this.borrowUSDb(amount);
        break;
    }
  }

  private borrowUSDb(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _reserve: this.persistenceService.allAddresses!.collateral.USDb
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.BORROW, params, IconTransactionType.WRITE);

    log.debug("borrowUSDb TX: ", tx);

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.BORROW);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }

  private borrowIcx(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _reserve: this.persistenceService.allAddresses!.collateral.sICX
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.BORROW, params, IconTransactionType.WRITE);

    log.debug("borrowIcx TX: ", tx);

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.BORROW);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }

}
