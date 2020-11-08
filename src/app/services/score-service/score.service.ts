import {Injectable} from '@angular/core';
import {IconApiService} from '../icon-api-service/icon-api.service';
import {ScoreMethodNames} from '../../common/score-method-names';
import {IconTransactionType} from '../../models/IconTransactionType';
import {PersistenceService} from '../persistence-service/persistence.service';
import {environment} from '../../../environments/environment';


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
    return this.iconApiService.iconService.call(tx).execute();
  }

  /**
   * @description Get user reserve data for a specific reserve
   * @param reserve - Address using 1 a  for USDb and sICX
   * @return Icon API response
   */
  public async getUserReserveDataForSpecificReserve(reserve: string | undefined): Promise<any> {
    if (reserve === undefined) {
      alert("getUserReserveDataForSpecificReserve->reserve undefined");
      throw new Error("getUserReserveDataForSpecificReserve->reserve undefined");
    }
    const tx = this.iconApiService.buildTransaction("",  reserve, ScoreMethodNames.GET_ALL_ADDRESSES,
      {_reserve: reserve, _user: this.persistenceService.iconexWallet?.address}, IconTransactionType.READ);
    return this.iconApiService.iconService.call(tx).execute();
  }

}
