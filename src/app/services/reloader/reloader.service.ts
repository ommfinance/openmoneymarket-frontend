import { Injectable } from '@angular/core';
import {DataLoaderService} from "../data-loader/data-loader.service";
import {PersistenceService} from "../persistence/persistence.service";
import {StateChangeService} from "../state-change/state-change.service";
import log from "loglevel";
import {Times} from "../../common/constants";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that manages reloading / refreshing of the data
 */
export class ReloaderService {

  // TODO: implement reloading of core and user data so that UI is not getting bugged.

  // base intervals
  public allReservesDataInterval: any;
  public allReservesConfigInterval: any;

  // user intervals
  public userSpecificDataInterval: any;

  public currentTimestamp: number = + new Date();

  constructor(private dataLoaderService: DataLoaderService,
              private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService) {
    // this.initLoginChangeListener();
    // this.registerBaseIntervals();

    // refresh current timestamp every 10 second
    this.refreshCurrentTimestamp();
    setInterval(() => this.refreshCurrentTimestamp() , Times.secondsInMilliseconds(10));
  }

  refreshCurrentTimestamp(): void {
    this.currentTimestamp = Math.floor(new Date().getTime() / 1000);
  }

  private initLoginChangeListener(): void {
    log.debug("initLoginChangeListener....");
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) {
        this.registerUserIntervals();
      } else {
        this.clearUserIntervals();
      }
    });
  }

  private registerBaseIntervals(): void {
    log.debug("registerBaseIntervals...");
    // register interval for all reserves data (need fresh exchange price)
    // this.allReservesDataInterval = setInterval(() => this.dataLoaderService.loadAllReserveData() , 30000);
    // // register interval for all reserves config data
    // this.allReservesConfigInterval = setInterval(() => this.dataLoaderService.loadAllReservesConfigData(), 30000);
  }

  private clearBaseIntervals(): void {
    clearInterval(this.allReservesDataInterval);
    clearInterval(this.allReservesConfigInterval);
  }

  public registerUserIntervals(): void {
    // if user logged in register user specific intervals
    if (this.persistenceService.userLoggedIn()) {
      // register interval for user balances
      // this.userSpecificDataInterval = setInterval(() => this.dataLoaderService.loadUserSpecificData(), 15000);
    }
  }

  public clearUserIntervals(): void {
    clearInterval(this.userSpecificDataInterval);
  }
}
