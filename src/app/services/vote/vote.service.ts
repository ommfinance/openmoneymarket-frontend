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
import {IconAmount, IconConverter} from "icon-sdk-js";
import {environment} from "../../../environments/environment";
import {Mapper} from "../../common/mapper";
import {Prep} from "../../models/Preps";
import {YourPrepVote} from "../../models/YourPrepVote";
import BigNumber from "bignumber.js";

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService) { }

  public stakeOmm(amount: BigNumber, notificationMessage: string): void {
    amount = amount.dp(2);
    const tx = this.buildStakeOmmTx(amount);

    log.debug(`Stake OMM TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  public unstakeOmm(amount: BigNumber, notificationMessage: string): void {
    amount = amount.dp(2);
    const tx = this.buildUnstakeOmmTx(amount);

    log.debug(`Unstake OMM TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  /**
   * @description Build Transaction for staking Omm Tokens
   * **Note**: if the user tries to increase the stake, ”_value” should be previous staked balance + amount being additionally staked
   * @return  Stake Omm Tokens transaction
   */
  private buildStakeOmmTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    log.debug(`Stake Omm amount = ` + amount);
    const decimals = 18;

    const params = {
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.STAKE_OMM, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Transaction for un-staking Omm Tokens
   * @return  Un-stake Omm Tokens transaction
   */
  private buildUnstakeOmmTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    log.debug(`Un-stake Omm amount = ` + amount);
    const decimals = 18;

    const params = {
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!!.address,
      this.persistenceService.allAddresses!.systemContract.LendingPool, ScoreMethodNames.UNSTAKE_OMM, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Icon transaction to remove all of the users votes
   * @return Icon tx
   */
  public buildRemoveAllVotes(): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!.address
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.CLEAR_PREVIOUS_DELEGATIONS, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Icon transaction to update user delegation preferences
   * @return  Icon tx
   */
  public buildUpdateUserDelegationPreferencesTx(yourVotesPrepList: YourPrepVote[]): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const delegations: {_address: string, _votes_in_per: string}[] = this.prepareDelegations(yourVotesPrepList);
    log.debug("delegations:", delegations);

    const params = {
      _delegations: delegations
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.UPDATE_DELEGATIONS, params, IconTransactionType.WRITE);
  }

  prepareDelegations(yourVotesPrepList: YourPrepVote[]): {_address: string, _votes_in_per: string}[] {
    // handle 3 votes by putting high precision 1/3 hex-es with last being rounded up at 18 decimal point
    if (yourVotesPrepList.length === 3) {
      return [
        {_address: yourVotesPrepList[0].address, _votes_in_per: "0x4a03ce68d215555"},
        {_address: yourVotesPrepList[1].address, _votes_in_per: "0x4a03ce68d215555"},
        {_address: yourVotesPrepList[2].address, _votes_in_per: "0x4a03ce68d215556"}
      ];
    }

    const delegations: {_address: string, _votes_in_per: string}[] = [];

    yourVotesPrepList.forEach(yourVote  => {
      delegations.push({
        _address: yourVote.address,
        _votes_in_per: IconConverter.toHex(IconAmount.of(yourVote.percentage, 16).toLoop())
      });
    });

    return delegations;
  }

  /**
   * @description Get Prep
   * @param prepAddress - Address of the Prep we want to fetch data for
   * @return  Returns the mapped Prep data
   */
  public async getPrep(prepAddress: string): Promise<Prep> {
    const params = {
      address : prepAddress
    };

    const tx = this.iconApiService.buildTransaction("",  environment.IISS_API,
      ScoreMethodNames.GET_PREP, params, IconTransactionType.READ);

    const prepList = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapPrep(prepList);
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
