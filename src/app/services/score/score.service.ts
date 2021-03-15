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
import {PrepList} from "../../models/Preps";
import {Mapper} from "../../common/mapper";


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
   * @description Get Token Distribution per day
   * @return  Token distribution per day in number
   */
  public async getTokenDistributionPerDay(): Promise<number> {
    this.checkerService.checkAllAddressesLoaded();

    const params = {
      _day: "0x1",
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Rewards,
      ScoreMethodNames.GET_TOKEN_DISTRIBUTION_PER_DAY, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getTokenDistributionPerDay: ", res);

    return Utils.hexToNormalisedNumber(res);
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
   * @description Get list of PReps
   * @return  Returns the status of all registered P-Rep candidates in descending order by delegated ICX amount
   */
  public async getListOfPreps(): Promise<PrepList> {
    log.debug("***** getListOfPreps ******");
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_PREP_TOP_LIST, {}, IconTransactionType.READ);

    const prepList = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapPrepList(prepList);
  }

  /**
   * @description Get today sicx to icx conversion rate
   * @return today sICX to ICX conversion rate as number
   */
  public async getTodayRate(): Promise<number> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_TODAY_RATE, {}, IconTransactionType.READ);

    const todayRate = Utils.hexToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getTodayRate: ${todayRate}`);

    return todayRate;
  }

  /**
   * @description Get loan origination fee percentage
   * @return number representing origination fee percentage
   */
  public async getLoanOriginationFeePercentage(): Promise<number> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_LOAN_ORIGINATION_FEE_PERCENTAGE, {}, IconTransactionType.READ);

    const loanOriginationFeePercentage = Utils.hexToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getLoanOriginationFeePercentage response: ${loanOriginationFeePercentage}`);

    return loanOriginationFeePercentage;
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

    return Utils.hexToNormalisedNumber(res);
  }

  public async getUserAssetBalance(assetTag: AssetTag): Promise<number> {
    log.debug(`Fetching user balance for ${assetTag}...`);

    let balance = 0;

    switch (assetTag) {
      case AssetTag.ICX:
        balance = await this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address);
        break;
      default:
        balance = await this.getIRC2TokenBalance(assetTag);
    }

    // set asset balance
    log.debug(`User (${this.persistenceService.activeWallet!.address}) ${assetTag} balance: ${balance}`);
    this.persistenceService.activeWallet!.balances.set(assetTag, balance);

    // commit the change
    this.stateChangeService.updateUserAssetBalance(balance, assetTag);

    return balance;
  }

  private async getIRC2TokenBalance(assetTag: AssetTag): Promise<number> {
    this.checkerService.checkUserLoggedInAllAddressesAndReservesLoaded();

    const decimals = this.persistenceService.allReserves!.getReserveData(assetTag).decimals;

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.collateralAddress(assetTag),
      ScoreMethodNames.BALANCE, {
        _owner: this.persistenceService.activeWallet!.address
      }, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();
    const balance = Utils.hexToNormalisedNumber(res, decimals);

    log.debug(`User (${this.persistenceService.activeWallet!.address}) ${assetTag} balance = ${balance}`);
    this.stateChangeService.updateUserAssetBalance(balance, assetTag);

    return balance;
  }

}
