import { Injectable } from '@angular/core';
import {IconApiService} from "../icon-api/icon-api.service";
import {PersistenceService} from "../persistence/persistence.service";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {CheckerService} from "../checker/checker.service";
import {TransactionDispatcherService} from "../transaction-dispatcher/transaction-dispatcher.service";
import {ScoreMethodNames} from "../../common/score-method-names";
import {IconTransactionType} from "../../models/IconTransactionType";
import log from "loglevel";
import {Utils} from "../../common/utils";

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService) { }

  /**
   * @description Get OMM token minimum stake amount
   * @return  Minimum OMM token stake amount
   */
  public async getOmmTokenMinStakeAmount(): Promise<number> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_MIN_STAKE, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getOmmTokenMinStakeAmount: ", res);

    return Utils.hexE18ToNormalisedNumber(res);
  }

  /**
   * @description Get user delegation details
   * @return  list of addresses and corresponding delegation detail
   */
  public async getUserDelegationDetails(): Promise<number> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_DELEGATION_DETAILS, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationDetails: ", res);

    // TODO mapping!
    return res;
  }



//   Get user delegation details
// { “to” :  from response in 1a for delegation,
// “method”: “getUserDelegationDetails”,
// “params”:{“_user”:”hx123…….”}
//
// Example response
// {
// “hx9a5a9c116379ecb9e4aadb423955fc9351771aa5”: 500000000000000000,
//  “hx9a5a9c116379ecb9e4aadb423955fc9351771aa6”: 500000000000000000
// }
// Note:for Percentage : 1% ~ 1 * 10**16




}
