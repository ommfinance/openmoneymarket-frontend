import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api/icon-api.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {IconTransactionType} from '../../models/IconTransactionType';
import {PersistenceService} from '../persistence/persistence.service';
import {environment} from '../../../environments/environment';
import {Utils} from "../../common/utils";
import {CheckerService} from "../checker/checker.service";
import {AllAddresses} from "../../models/AllAddresses";
import {UserReserveData} from "../../models/UserReserveData";
import {AllReservesData, ReserveData} from "../../models/AllReservesData";
import {UserAccountData} from "../../models/UserAccountData";
import {ReserveConfigData} from "../../models/ReserveConfigData";
import {StateChangeService} from "../state-change/state-change.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";


@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private checkerService: CheckerService,
              private stateChangeService: StateChangeService) {
  }

  /**
   * @description Get all SCORE addresses (collateral, oTokens, System Contract, ..)
   * @return  List os collateral, oTokens and System Contract addresses
   */
  public async getAllScoreAddresses(): Promise<AllAddresses> {
    const tx = this.iconApiService.buildTransaction("",  environment.ADDRESS_PROVIDER_SCORE,
      ScoreMethodNames.GET_ALL_ADDRESSES, {}, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get user reserve data for a specific reserve
   * @param reserve - Address using 1 a  for USDb and sICX
   * @return reserve data
   */
  public async getUserReserveDataForSpecificReserve(reserve: string): Promise<UserReserveData> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet?.address,
      _reserve: reserve
    };
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_RESERVE_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get user reserve data for a all reserves
   * @return All user reserve data
   */
  public async getUserReserveDataForAllReserves(): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_ALL_RESERVE_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get user account data
   * @return All user reserve data
   */
  public async getUserAccountData(): Promise<UserAccountData> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_ACCOUNT_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get today sicx to icx conversion rate
   * @return today sICX to ICX conversion rate as number
   */
  public async getTodayRate(): Promise<number> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_TODAY_RATE, {}, IconTransactionType.READ);

    const todayRate = Utils.hexE18ToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getTodayRate: ${todayRate}`);

    return todayRate;
  }

  /**
   * @description Get configuration data for the specific reserve
   * @param reserve - Address using 1 a  for USDb and sICX
   * @return reserve configuration data
   */
  public async getReserveConfigurationData(reserve: string): Promise<ReserveConfigData> {
    const params = {
      _reserve: reserve
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_RESERVE_CONFIGURATION_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get configuration data for all reserves
   * @return All reserves configuration data
   */
  public async getAllReserveConfigurationData(): Promise<any> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_ALL_RESERVE_CONFIGURATION_DATA, {}, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get reserve data for all reserves
   * @return All reserve data
   */
  public async getAllReserveData(): Promise<AllReservesData> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_ALL_RESERVE_DATA, {}, IconTransactionType.READ);

    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get reserve data for a specific reserve
   * @param reserve - Address using 1 a  for USDb and sICX
   * @return ReserveData
   */
  public async getsSpecificReserveData(reserve: string): Promise<ReserveData> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_SPECIFIC_RESERVE_DATA, { _reserve: reserve }, IconTransactionType.READ);

    return await this.iconApiService.iconService.call(tx).execute();
  }


  private async getUserUSDbBalance(address?: string): Promise<number> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.collateral.USDb,
      ScoreMethodNames.BALANCE, {
        _owner: address ?? this.persistenceService.activeWallet?.address
      }, IconTransactionType.READ);
    const res = await this.iconApiService.iconService.call(tx).execute();
    const balance = Utils.hexE18To2DecimalRoundedDown(res);
    log.debug(`User USDb balance = ${balance}`);
    this.stateChangeService.updateUserAssetBalance(balance, AssetTag.USDb);
    return balance;
  }

  public async getUserAssetBalance(assetTag: AssetTag): Promise<number> {
    let balance = 0;
    switch (assetTag) {
      case AssetTag.ICX:
        balance = await this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address);
        break;
      case AssetTag.USDb:
        balance = await this.getUserUSDbBalance(this.persistenceService.activeWallet!.address);
        break;
    }

    // set asset balance
    log.debug(`User ${assetTag} balance: ${balance}`);
    this.persistenceService.activeWallet!.balances.set(assetTag, balance);

    // commit the change
    this.stateChangeService.updateUserAssetBalance(balance, assetTag);

    return balance;
  }


}
