import { Injectable } from '@angular/core';
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {CheckerService} from "../checker/checker.service";
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";

@Injectable({
  providedIn: 'root'
})
export class ClaimIcxService {

  constructor(private checkerService: CheckerService,
              private iconApiService: IconApiService,
              private persistenceService: PersistenceService) { }

  /**
   * @description Build tx to claim unstaked ICX
   * @return  Icon Transaction
   */
  public async buildClaimUnstakedIcxTx(): Promise<number> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.Staking, ScoreMethodNames.CLAIM_UNSTAKED_ICX, {}, IconTransactionType.WRITE);
  }

}
