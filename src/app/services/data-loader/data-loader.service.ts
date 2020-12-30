import {Injectable} from '@angular/core';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves, ReserveData} from "../../interfaces/all-reserves";
import {Mapper} from "../../common/mapper";
import {Reserve} from "../../interfaces/reserve";
import {UserAccountData} from "../../models/user-account-data";
import {StateChangeService} from "../state-change/state-change.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";
import {IconexWallet} from "../../models/IconexWallet";
import {BridgeWallet} from "../../models/BridgeWallet";
import {IconApiService} from "../icon-api/icon-api.service";
import {OmmError} from "../../core/errors/OmmError";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  constructor(private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private iconApiService: IconApiService) {
  }

  public async walletLogin(wallet: IconexWallet | BridgeWallet, iconAddress: string): Promise<void> {
    this.persistenceService.activeWallet = wallet;

    try {
      const [usdbReserveResponse, icxReserveResponse, icxBalResponse, usdbBalResponse] = await Promise.all([
        this.loadUserUSDbReserveData(),
        this.loadUserIcxReserveData(),
        this.iconApiService.getIcxBalance(iconAddress),
        this.scoreService.getUserBalanceOfUSDb(iconAddress)
      ]);

      // set ICX balance
      log.debug(`User ICX balance: ${icxBalResponse}`);
      this.persistenceService.activeWallet!.balances.set(AssetTag.ICX, icxBalResponse);

      // set USDb balance
      log.debug(`User USDb balance: ${usdbBalResponse}`);
      this.persistenceService.activeWallet!.balances.set(AssetTag.USDb, usdbBalResponse);
    } catch (e) {
      throw new OmmError("Error occurred! Try again in a moment.", e);
    }

    this.stateChangeService.updateLoginStatus(this.persistenceService.activeWallet);
  }

  public walletLogout(): void {
    this.persistenceService.activeWallet = undefined;
    this.stateChangeService.updateLoginStatus(this.persistenceService.activeWallet);
  }

  public loadAllScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.persistenceService.allAddresses = allAddresses;
      log.debug("Loaded all addresses: ", allAddresses);
    });
  }

  public loadAllReserves(): Promise<void> {
    return this.scoreService.getReserveDataForAllReserves().then((allReserves: AllReserves) => {
      Object.entries(allReserves).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        allReserves[value[0]] = Mapper.mapReserveData(value[1]);
      });
      this.persistenceService.allReserves = allReserves;
      log.debug("loadAllReserves: ", allReserves);
    });
  }

  public loadUserUSDbReserveData(): void {
    let mappedReserve: any;
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.USDb)
      .then((res: Reserve) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.USDb, mappedReserve);
        log.debug("User USDb reserve:", res);
        this.stateChangeService.updateUserUSDbReserve(mappedReserve);
      });
  }

  public loadUserIcxReserveData(): void {
    let mappedReserve: any;
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.sICX)
      .then((res: Reserve) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.ICX, mappedReserve);
        log.debug("User ICX reserve data:", res);
        this.stateChangeService.updateUserIcxReserve(mappedReserve);
      });
  }

  public loadUserAccountData(): void {
    this.scoreService.getUserAccountData().then((userAccountData: UserAccountData) => {
      this.persistenceService.userAccountData = Mapper.mapUserAccountData(userAccountData);
    });
  }
}
