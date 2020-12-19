import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {ScoreService} from "../score/score.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {IconexRequestsMap} from "../../common/iconex-requests-map";
import {CheckerService} from "../checker/checker.service";

@Injectable({
  providedIn: 'root'
})
export class WithdrawService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private scoreService: ScoreService,
              private checkerService: CheckerService) {
  }

  public withdrawUSDb(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.iconexWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oUSDb, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);

    console.log("TX: ", tx);
    this.scoreService.getUserBalanceOfUSDb().then(res => {
      console.log("USDb balance before withdraw: ", res);
    });

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.WITHDRAW_USDb);
  }

  public withdrawIcx(amount: number, waitForUnstaking = false): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    // TODO: refactor for Bridge
    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _waitForUnstaking: waitForUnstaking ? "0x1" : "0x0"
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.iconexWallet!.address,
      this.persistenceService.allAddresses!.oTokens.oICX, ScoreMethodNames.REDEEM, params, IconTransactionType.WRITE);

    console.log("TX: ", tx);

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.WITHDRAW_ICX);
  }
}
