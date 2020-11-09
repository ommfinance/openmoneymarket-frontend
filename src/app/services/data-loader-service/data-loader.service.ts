import { Injectable } from '@angular/core';
import {ScoreService} from '../score-service/score.service';
import {PersistenceService} from '../persistence-service/persistence.service';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves} from "../../interfaces/AllReserves";
import {Mapper} from "../../common/mapper";

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
      console.log("All addresses: ", allAddresses);
    });
  }

  public loadAllReserves(): Promise<void> {
    return this.scoreService.getReserveDataForAllReserves().then((allReserves: AllReserves) => {
      this.persistenceService.allReserves = Mapper.mapAllReserves(allReserves);
      console.log("All reserves: ", allReserves);
    });
  }
}
