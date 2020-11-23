import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api-service/icon-api.service";
import {PersistenceService} from "../persistence-service/persistence.service";
import {MockScoreService} from "../mock-score/mock-score.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {ScoreService} from "../score-service/score.service";
import {IconAmount, IconConverter} from "icon-sdk-js";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {IconexRequestsMap} from "../../common/iconex-requests-map";
import {CheckerService} from "../checker-service/checker.service";

@Injectable({
  providedIn: 'root'
})
export class BorrowService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private mockScoreService: MockScoreService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService) {
  }

  public borrowUSDb(amount: number): void {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _amount: IconConverter.toHex(IconAmount.of(amount, IconAmount.Unit.ICX).toLoop()),
      _reserve: this.persistenceService.allAddresses!.collateral.USDb
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.iconexWallet!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.BORROW_USDB, params, IconTransactionType.WRITE);

    console.log("borrowUSDb TX: ", tx);

    this.iconexApiService.dispatchSendTransactionEvent(tx, IconexRequestsMap.BORROW_USDb);
  }

}
