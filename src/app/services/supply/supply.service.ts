import {Injectable} from '@angular/core';
import {IconTransactionType} from '../../models/IconTransactionType';
import {IconAmount, IconConverter} from "icon-sdk-js";
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
import {AssetTag} from "../../models/Asset";
import {OmmError} from "../../core/errors/OmmError";
import {BridgeWallet} from "../../models/BridgeWallet";
import {BridgeWidgetService} from "../bridge-widget/bridge-widget.service";


@Injectable({
  providedIn: 'root'
})
export class SupplyService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService,
              private checkerService: CheckerService,
              private bridgeWidgetService: BridgeWidgetService) {
  }

  public supplyAsset(amount: number, assetTag: AssetTag): void {
    switch (assetTag) {
      case AssetTag.ICX:
        this.depositIcxToLendingPool(amount);
        break;
      case AssetTag.USDb:
        this.depositUSDb(amount);
        break;
    }
  }

  private depositUSDb(amount: number): void {
    if (this.persistenceService.activeWallet == null) {
      throw new OmmError("Please connect your Iconex wallet!");
    }

    this.transferUSDbTokenToLendingPool(amount, this.persistenceService.activeWallet);
  }

  private transferUSDbTokenToLendingPool(amount: number, wallet: IconexWallet): void {
    log.debug("Deposit USDb amount = " + amount);
    if (!this.persistenceService.allAddresses) {
      throw new OmmError("SCORE all addresses not loaded!");
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
    this.scoreService.getUserAssetBalance(AssetTag.USDb).then(res => {
      log.debug("USDb balance before: ", res);
    });

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.SUPPLY);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }

  private depositIcxToLendingPool(amount: number): void {
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

    if (this.persistenceService.activeWallet instanceof IconexWallet) {
      this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.SUPPLY);
    } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
      this.bridgeWidgetService.sendTransaction(tx);
    }
  }

}
