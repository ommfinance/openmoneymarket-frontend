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
import {Prep, PrepList} from "../../models/Preps";
import {DelegationPreference} from "../../models/DelegationPreference";
import {AssetTag} from "../../models/Asset";

@Injectable({
  providedIn: 'root'
})
export class VoteService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private iconexApiService: IconexApiService,
              private checkerService: CheckerService,
              private transactionDispatcherService: TransactionDispatcherService) { }

  public stakeOmm(amount: number, notificationMessage: string): void {
    amount = Utils.roundDownTo2Decimals(amount);
    const tx = this.buildStakeOmmTx(amount);

    log.debug(`Stake OMM TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  public unstakeOmm(amount: number, notificationMessage: string): void {
    amount = Utils.roundDownTo2Decimals(amount);
    const tx = this.buildUnstakeOmmTx(amount);

    log.debug(`Unstake OMM TX: `, tx);
    this.transactionDispatcherService.dispatchTransaction(tx, notificationMessage);
  }

  /**
   * @description Build Transaction for staking Omm Tokens
   * **Note**: if the user tries to increase the stake, ”_value” should be previous staked balance + amount being additionally staked
   * @return  Stake Omm Tokens transaction
   */
  private buildStakeOmmTx(amount: number): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    log.debug(`Stake Omm amount = ` + amount);
    const decimals = 18;

    const params = {
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!!.address,
      this.persistenceService.allAddresses!.systemContract.OmmToken, ScoreMethodNames.STAKE_OMM, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Transaction for un-staking Omm Tokens
   * @return  Un-stake Omm Tokens transaction
   */
  private buildUnstakeOmmTx(amount: number): any {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    log.debug(`Un-stake Omm amount = ` + amount);
    const decimals = 18;

    const params = {
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
    };

    return this.iconApiService.buildTransaction(this.persistenceService.activeWallet!!.address,
      this.persistenceService.allAddresses!.systemContract.OmmToken, ScoreMethodNames.UNSTAKE_OMM, params, IconTransactionType.WRITE);
  }

  /**
   * @description Get user delegation details
   * @return  list of addresses and corresponding delegation detail
   */
  public async getUserDelegationDetails(): Promise<number> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_DELEGATION_DETAILS, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationDetails: ", res);

    // TODO mapping!
    return res;
  }

  /**
   * @description Update user delegation preferences
   * @return  TODO
   */
  public async updateUserDelegationPreferences(delegationPreferences: DelegationPreference[]): Promise<number> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const delegations: {_address: string, _votes_in_per: string}[] = [];

    delegationPreferences.forEach(delegationPreference => {
      delegations.push({
        _address: delegationPreference._address,
        _votes_in_per: IconConverter.toHex(IconAmount.of(delegationPreference._votes_in_per, 18).toLoop())});
    });

    const params = {
      _delegations: delegations
    };

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
      this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.UPDATE_DELEGATIONS, params, IconTransactionType.WRITE);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("updateUserDelegationPreferences: ", res);

    // TODO mapping!
    return res;
  }

  /**
   * @description Get list of PReps
   * @return  Returns the status of all registered P-Rep candidates in descending order by delegated ICX amount
   */
  public async getListOfPreps(startRanking: number = 1, endRanking: number = 100): Promise<PrepList> {
    const params = {
      startRanking: IconConverter.toHex(startRanking),
      endRanking: IconConverter.toHex(endRanking)
    };

    const tx = this.iconApiService.buildTransaction("",  environment.IISS_API,
      ScoreMethodNames.GET_PREPS, params, IconTransactionType.READ);

    const prepList = await this.iconApiService.iconService.call(tx).execute();


    return Mapper.mapPrepList(prepList);
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