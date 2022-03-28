import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {CheckerService} from "../checker/checker.service";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import {UserOmmRewards} from "../../models/UserOmmRewards";
import log from "loglevel";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";

@Injectable({
  providedIn: 'root'
})
export class OmmService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private checkerService: CheckerService) {

  }

  /**
   * @description Claim OMM rewards
   * @return Built transaction
   */
  public buildClaimOmmRewardsTx(): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.CLAIM_OMM_REWARDS,
      {}, IconTransactionType.WRITE);
  }

  /**
   * @description Get OMM rewards per user
   * @return UserOmmRewards - Omm rewards per user
   */
  public async getOmmRewardsPerUser(): Promise<UserOmmRewards> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    log.debug("Executing getOmmRewardsPerUser...");

    const params = {
      _user: this.persistenceService.activeWallet!.address,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Rewards,
      ScoreMethodNames.GET_OMM_REWARDS_PER_USER, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getOmmRewardsPerUser: ", res);

    return res;
  }

  /**
   * @description Get OMM token balance details
   * @return OmmTokenBalanceDetails - Omm token balance details
   */
  public async getOmmTokenBalanceDetails(): Promise<OmmTokenBalanceDetails> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _owner: this.persistenceService.activeWallet!.address,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_OMM_TOKEN_BALANCE_DETAILS, params, IconTransactionType.READ);

    log.debug("Executing getOmmTokenBalanceDetails tx: ", tx);
    try {
      const res = await this.iconApiService.iconService.call(tx).execute();
      log.debug("getOmmTokenBalanceDetails: ", res);

      return res;
    } catch (e) {
      log.error(e);
      throw e;
    }
  }


}
