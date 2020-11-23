import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api-service/icon-api.service";
import {PersistenceService} from "../persistence-service/persistence.service";
import {MockScoreService} from "../mock-score/mock-score.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {IconexRequestsMap} from "../../common/iconex-requests-map";
import {Utils} from "../../common/utils";
import {CheckerService} from "../checker-service/checker.service";

@Injectable({
  providedIn: 'root'
})
export class RepayService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private mockScoreService: MockScoreService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService) {
  }

  public repayUSDb(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const amountString = Utils.scientificNotationToBigNumberString(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop());
    console.log("repayUSDb amount = " + amount, "repayUSDb params amount = " + amountString);

    const to = this.persistenceService.allAddresses!.collateral.USDb;
    const data = `'{ "method": "repay", "params": {"_reserveAddress":"${to}" ,"amount":"${amountString}"}}'`;

    const params = {
      _to: this.persistenceService.allAddresses!.systemContract.LendingPool,
      _value: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _data: IconConverter.fromUtf8(data)
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.iconexWallet!.address, to,
      ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    console.log("repayUSDb TX: ", tx);

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.DEPOSIT_USDb);
  }
}
