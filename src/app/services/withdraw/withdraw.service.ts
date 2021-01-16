import {Injectable} from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {ScoreService} from "../score/score.service";
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
export class WithdrawService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService,
              private checkerService: CheckerService,
              private bridgeWidgetService: BridgeWidgetService) {
  }

  public withdrawAsset(amount: number, assetTag: AssetTag): void {
    switch (assetTag) {
      case AssetTag.ICX:
        this.withdrawIcx(amount);
        break;
      case AssetTag.USDb:
        this.withdrawUSDb(amount);
        break;
    }
  }

  private withdrawUSDb(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oUSDb, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);

    log.debug("TX: ", tx);
    this.scoreService.getUserAssetBalance(AssetTag.USDb).then(res => {
      log.debug("USDb balance before withdraw: ", res);
    });

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.WITHDRAW);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }

  private withdrawIcx(amount: number, waitForUnstaking = false): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _waitForUnstaking: waitForUnstaking ? "0x1" : "0x0"
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oICX, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);

    log.debug("TX: ", tx);

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.WITHDRAW);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }
}
