import {Injectable} from '@angular/core';
import {ScoreService} from '../score/score.service';
import {PersistenceService} from '../persistence/persistence.service';
import {AllAddresses} from '../../models/AllAddresses';
import {AllReservesData, ReserveData} from "../../models/AllReservesData";
import {Mapper} from "../../common/mapper";
import {UserReserveData} from "../../models/UserReserveData";
import {UserAccountData} from "../../models/UserAccountData";
import {StateChangeService} from "../state-change/state-change.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {OmmError} from "../../core/errors/OmmError";
import {AllReserveConfigData} from "../../models/AllReserveConfigData";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import {OmmService} from "../omm/omm.service";
import {OmmRewards} from "../../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {NotificationService} from "../notification/notification.service";
import {ErrorCode, ErrorService} from "../error/error.service";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  constructor(private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private ommService: OmmService,
              private notificationService: NotificationService,
              private errorService: ErrorService) {

  }

  public async walletLogin(wallet: IconexWallet | BridgeWallet | LedgerWallet): Promise<void> {
    this.persistenceService.activeWallet = wallet;
    log.info("Login with wallet: ", wallet);

    try {
      // TODO optimise by saving and reading from localstorage
      const [usdbReserveResponse, icxReserveResponse, icxBalResponse, usdbBalResponse, userAccountDataRes
      ] = await Promise.all([
        this.loadUserUSDbReserveData(),
        this.loadUserIcxReserveData(),
        this.scoreService.getUserAssetBalance(AssetTag.ICX),
        this.scoreService.getUserAssetBalance(AssetTag.USDb),
        this.loadUserAccountData()
      ]);

    } catch (e) {
      log.debug(e);
      this.persistenceService.activeWallet = undefined;
      this.notificationService.showNewNotification("Error occurred! Try again in a moment.");
      throw new OmmError("Error occurred! Try again in a moment.", e);
    }

    // gracefully fetch Omm part
    try {
      const [userOmmRewRes, userOmmTokBalDet
      ] = await Promise.all([
        this.loadUserOmmRewards(),
        this.loadUserOmmTokenBalanceDetails()
      ]);
    } catch (e) {
      log.error("Error in [loadUserOmmRewards, loadUserOmmTokenBalanceDetails]");
    }

    this.stateChangeService.updateLoginStatus(this.persistenceService.activeWallet);
  }

  public walletLogout(): void {
    // clear active wallet
    this.persistenceService.activeWallet = undefined;

    // commit change to the state change service
    this.stateChangeService.updateLoginStatus(this.persistenceService.activeWallet);
  }

  public loadAllUserAssetsBalances(): void {
    Object.values(AssetTag).forEach(assetTag => {
      this.scoreService.getUserAssetBalance(assetTag);
    });
  }

  public loadAllScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.persistenceService.allAddresses = allAddresses;
      log.debug("Loaded all addresses: ", allAddresses);
    });
  }

  public loadAllReserveData(): Promise<void> {
    return this.scoreService.getAllReserveData().then((allReserves: AllReservesData) => {
      log.debug("loadAllReserves.allReserves: ", allReserves);
      const newAllReserve = new AllReservesData(allReserves.USDb, allReserves.ICX);
      Object.entries(newAllReserve).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        newAllReserve[value[0]] = Mapper.mapReserveData(value[1]);
      });
      this.persistenceService.allReserves = newAllReserve;
      log.debug("loadAllReserves.allReserves after: ", this.persistenceService.allReserves);
    });
  }

  public loadSpecificReserveData(assetTag: AssetTag): Promise<void> {
    return this.scoreService.getsSpecificReserveData(this.persistenceService.allAddresses!.getAssetAddress(assetTag))
      .then(reserveData => {
        const newReserveData = Mapper.mapReserveData(reserveData);
        this.persistenceService.allReserves?.setReserveData(assetTag, newReserveData);
        log.debug(`Loaded ${assetTag} reserveData: `, newReserveData);
      }).catch(e => {
        throw new OmmError(`Error occurred in loadSpecificReserveData`, e);
      });
  }

  public loadAllReservesConfigData(): Promise<void> {
    return this.scoreService.getAllReserveConfigurationData().then((allReservesConfigData: AllReserveConfigData) => {
      log.debug("loadAllReservesConfigData : ", allReservesConfigData);
      const newAllReserveConfigData = new AllReserveConfigData(allReservesConfigData.USDb, allReservesConfigData.ICX);
      Object.entries(newAllReserveConfigData).forEach((value: [string, ReserveData]) => {
        // @ts-ignore
        newAllReserveConfigData[value[0]] = Mapper.mapReserveConfigurationData(value[1]);
      });
      this.persistenceService.allReservesConfigData = newAllReserveConfigData;
      log.debug("loadAllReservesConfigData after mapping : ", newAllReserveConfigData);
    }).catch(e => {
      throw new OmmError(`Error occurred in loadAllReservesConfigData`, e);
    });
  }

  public loadUserAssetReserveData(assetTag: AssetTag): Promise<void> {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.loadUserIcxReserveData();
      case AssetTag.USDb:
        return this.loadUserUSDbReserveData();
      default:
        return Promise.resolve();
    }
  }

  public loadUserUSDbReserveData(): Promise<void> {
    let mappedReserve: any;
    return this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.USDb)
      .then((res: UserReserveData) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.USDb, mappedReserve);
        log.debug("User USDb reserve data:", mappedReserve);
        this.stateChangeService.updateUserAssetReserve(mappedReserve, AssetTag.USDb);
      });
  }

  public loadAllUserAssetReserveData(): void {
    if (this.persistenceService.activeWallet) {
      this.loadUserUSDbReserveData().then();
      this.loadUserIcxReserveData().then();
    }
  }

  public loadUserIcxReserveData(): Promise<void> {
    let mappedReserve: any;
    return this.scoreService.getUserReserveDataForSpecificReserve(this.persistenceService.allAddresses!.collateral.sICX)
      .then((res: UserReserveData) => {
        mappedReserve = Mapper.mapUserReserve(res);
        this.persistenceService.userReserves!.reserveMap.set(AssetTag.ICX, mappedReserve);
        log.debug("User ICX reserve data:", mappedReserve);
        this.stateChangeService.updateUserAssetReserve(mappedReserve, AssetTag.ICX);
      });
  }

  public loadUserAccountData(): Promise<void> {
    return this.scoreService.getUserAccountData().then((userAccountData: UserAccountData) => {
      this.persistenceService.userAccountData = Mapper.mapUserAccountData(userAccountData);
      this.stateChangeService.updateUserAccountData(this.persistenceService.userAccountData);
      log.debug("loadUserAccountData -> userAccountData:", this.persistenceService.userAccountData);
    });
  }

  public loadUserOmmRewards(): Promise<void> {
    return this.ommService.getOmmRewardsPerUser().then((ommRewards: OmmRewards) => {
      this.errorService.deregisterError(ErrorCode.USER_OMM_REWARDS);

      this.persistenceService.userOmmRewards = Mapper.mapUserOmmRewards(ommRewards);
      this.stateChangeService.updateUserOmmRewards(this.persistenceService.userOmmRewards);
    }).catch((e: any) => {
      this.errorService.registerErrorForResolve(ErrorCode.USER_OMM_REWARDS, this.loadUserOmmRewards);
      log.error(e);
    });
  }

  public loadUserOmmTokenBalanceDetails(): Promise<void> {
    return this.ommService.getOmmTokenBalanceDetails().then((res: OmmTokenBalanceDetails) => {
      this.errorService.deregisterError(ErrorCode.USER_OMM_TOKEN_BALANCE_DETAILS);

      this.persistenceService.userOmmTokenBalanceDetails = Mapper.mapUserOmmTokenBalanceDetails(res);
      this.stateChangeService.updateUserOmmTokenBalanceDetails(this.persistenceService.userOmmTokenBalanceDetails);
    }).catch((e: any) => {
      this.errorService.registerErrorForResolve(ErrorCode.USER_OMM_TOKEN_BALANCE_DETAILS, this.loadUserOmmTokenBalanceDetails);
      log.error(e);
    });
  }

  public loadTokenDistributionPerDay(): Promise<void> {
    return this.scoreService.getTokenDistributionPerDay().then(res => {
      this.persistenceService.tokenDistributionPerDay = res;
    });
  }

  public loadUserSpecificData(): void {
    this.loadAllUserAssetReserveData();
    this.loadAllUserAssetsBalances();
    this.loadUserAccountData().then();
    this.loadUserOmmRewards().then();
    this.loadUserOmmTokenBalanceDetails().then();
  }
}
