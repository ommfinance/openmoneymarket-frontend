import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api-service/icon-api.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {IconTransactionType} from '../../models/IconTransactionType';
import {PersistenceService} from '../persistence-service/persistence.service';
import {environment} from '../../../environments/environment';
import {Utils} from "../../common/utils";


@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService) {
  }

  public async getAllScoreAddresses(): Promise<any> {
    const tx = this.iconApiService.buildTransaction("",  environment.ADDRESS_PROVIDER_SCORE,
      ScoreMethodNames.GET_ALL_ADDRESSES, {}, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get user reserve data for a specific reserve
   * @param reserve - Address using 1 a  for USDb and sICX
   * @return Icon API response
   */
  public async getUserReserveDataForSpecificReserve(reserve: string | undefined): Promise<any> {
    if (!reserve || !this.persistenceService.allAddresses) {
      alert("getUserReserveDataForSpecificReserve->reserve or allAddresses undefined");
      throw new Error("getUserReserveDataForSpecificReserve->reserve or allAddresses undefined");
    }
    if (!this.persistenceService.iconexWallet) {
      alert("getUserReserveDataForSpecificReserve-> No wallet connected!");
      throw new Error("getUserReserveDataForSpecificReserve-> No wallet connected!");
    }
    const params = {
      _user: this.persistenceService.iconexWallet?.address,
      _reserve: reserve
    };
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses?.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_RESERVE_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  public async getUserReserveDataForAllReserves(): Promise<any> {
    if (!this.persistenceService.allAddresses || !this.persistenceService.iconexWallet) {
      alert("getUserReserveDataForAllReserves->allAddresses or iconexWalletundefined");
      throw new Error("getUserReserveDataForAllReserves->allAddresses or iconexWallet undefined");
    }
    const params = {
      _user: this.persistenceService.iconexWallet.address
    };
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses?.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_ALL_RESERVE_DATA, params, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  public async getReserveDataForAllReserves(): Promise<any> {
    if (!this.persistenceService.allAddresses) {
      alert("getReserveDataForAllReserves->allAddresses");
      throw new Error("getReserveDataForAllReserves->allAddresses undefined");
    }
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses?.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_ALL_RESERVE_DATA, {}, IconTransactionType.READ);
    return await this.iconApiService.iconService.call(tx).execute();
  }

  public async getUserBalanceOfUSDb(address?: string): Promise<number> {
    if (!this.persistenceService.allAddresses) {
      alert("getUserBalanceOfUSDb: All addresses not loaded!");
      return -1;
    }
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses?.collateral.USDb,
      ScoreMethodNames.BALANCE, {
        _owner: address ?? this.persistenceService.iconexWallet?.address
      }, IconTransactionType.READ);
    const res = await this.iconApiService.iconService.call(tx).execute();
    const balance = Utils.ixcValueToNormalisedValue(res);
    this.persistenceService.updateUserUSDbBalance(balance);
    return balance;
  }

}
