import { Injectable } from '@angular/core';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves, ReserveData} from "../../interfaces/all-reserves";
import {Mapper} from "../../common/mapper";
import {Reserve} from "../../interfaces/reserve";
import {UserAccountData} from "../../models/user-account-data";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  constructor(private scoreService: ScoreService,
              private persistenceService: PersistenceService) {
  }

  public loadAllScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.persistenceService.allAddresses = allAddresses;
      console.log("Loaded all addresses: ", allAddresses);
    });
  }

  public loadAllReserves(): Promise<void> {
    return this.scoreService.getReserveDataForAllReserves().then((allReserves: AllReserves) => {
      Object.entries(allReserves).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        allReserves[value[0]] = Mapper.mapReserveData(value[1]);
      });
      this.persistenceService.allReserves = allReserves;
      console.log("loadAllReserves: ", allReserves);
    });
  }

  public loadUserUSDbReserveData(): void {
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.USDb)
      .then((res: Reserve) => {
        this.persistenceService.userUSDbReserve = Mapper.mapUserReserve(res);
        console.log("userUSDbReserve:", res);
        this.persistenceService.updateUserUSDbReserve(this.persistenceService.userUSDbReserve);
      });
  }

  public loadUserIcxReserveData(): void {
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.sICX)
      .then((res: Reserve) => {
        this.persistenceService.userIcxReserve = Mapper.mapUserReserve(res);
        console.log("userIcxReserveData:", res);
        this.persistenceService.updateUserIcxReserve(this.persistenceService.userIcxReserve);
      });
  }

  public loadUserAccountData(): void {
    this.scoreService.getUserAccountData().then((userAccountData: UserAccountData) => {
      this.persistenceService.userAccountData = Mapper.mapUserAccountData(userAccountData);
    });
  }
}
