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
import {AllReserveConfigData} from "../../models/AllReserveConfigData";

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
      // TODO optimise by saving and reading from localstorage
      const [usdbReserveResponse, icxReserveResponse, icxBalResponse, usdbBalResponse] = await Promise.all([
        this.loadUserUSDbReserveData(),
        this.loadUserIcxReserveData(),
        this.scoreService.getUserAssetBalance(AssetTag.ICX),
        this.scoreService.getUserAssetBalance(AssetTag.USDb)
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
      const newAllReserve = new AllReserves(allReserves.USDb, allReserves.sICX);
      Object.entries(newAllReserve).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        newAllReserve[value[0]] = Mapper.mapReserveData(value[1]);
      });
      this.persistenceService.allReserves = newAllReserve;
      log.debug("loadAllReserves: ", newAllReserve);
    });
  }

  public loadAllReservesConfigData(): Promise<void> {
    return this.scoreService.getAllReserveConfigurationData().then((allReservesConfigData: AllReserveConfigData) => {
      log.debug("loadAllReservesConfigData : ", allReservesConfigData);
      const newAllReserveConfigData = new AllReserveConfigData(allReservesConfigData.USDb, allReservesConfigData.sICX);
      Object.entries(newAllReserveConfigData).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        newAllReserveConfigData[value[0]] = Mapper.mapReserveConfigurationData(value[1]);
      });
      this.persistenceService.allReservesConfigData = newAllReserveConfigData;
      log.debug("loadAllReservesConfigData after mapping : ", newAllReserveConfigData);
    });
  }

  public loadUserUSDbReserveData(): void {
    let mappedReserve: any;
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.USDb)
      .then((res: Reserve) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.USDb, mappedReserve);
        log.debug("User USDb reserve:", res);
        this.stateChangeService.updateUserAssetReserve(mappedReserve, AssetTag.USDb);
      });
  }

  public loadUserIcxReserveData(): void {
    let mappedReserve: any;
    this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.sICX)
      .then((res: Reserve) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.ICX, mappedReserve);
        log.debug("User ICX reserve data:", res);
        this.stateChangeService.updateUserAssetReserve(mappedReserve, AssetTag.ICX);
      });
  }

  public loadUserAccountData(): void {
    this.scoreService.getUserAccountData().then((userAccountData: UserAccountData) => {
      this.persistenceService.userAccountData = Mapper.mapUserAccountData(userAccountData);
    });
  }
}
