import { Injectable } from '@angular/core';
import {ScoreService} from '../score-service/score.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves} from "../../interfaces/all-reserves";
import {Mapper} from "../../common/mapper";
import {IconWallet} from "../../models/IconWallet";
import {UserUSDbReserve} from "../../interfaces/user-usdb-reserve";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  constructor(private scoreService: ScoreService,
              private persistenceService: PersistenceService) {
  }

  public loadScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.persistenceService.allAddresses = allAddresses;
      console.log("Loaded all addresses: ", allAddresses);
    });
  }

  public loadAllReserves(): Promise<void> {
    return this.scoreService.getReserveDataForAllReserves().then((allReserves: AllReserves) => {
      allReserves.USDb = Mapper.mapHexStringsOfObjectToNormalisedValue(allReserves.USDb);
      this.persistenceService.allReserves = allReserves;
      console.log("loadAllReserves: ", allReserves);
    });
  }

  public loadUserUSDbReserveData() {
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses?.collateral.USDb)
      .then((res: UserUSDbReserve) => {
        this.persistenceService.userUSDbReserve = Mapper.mapUserUSDbReserve(res);
        console.log("userUSDbReserve:", res);
        this.persistenceService.updateUserUSDbReserve(this.persistenceService.userUSDbReserve);
      });
  }
}
