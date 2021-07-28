import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {UserReserveData} from "../../models/UserReserveData";
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag, CollateralAssetTag} from "../../models/Asset";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {UserAccountData} from "../../models/UserAccountData";
import {ModalAction, ModalActionsResult} from "../../models/ModalAction";
import {OmmRewards} from "../../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {PrepList} from "../../models/Preps";
import {YourPrepVote} from "../../models/YourPrepVote";
import log from "loglevel";
import {PoolData} from "../../models/PoolData";
import {UserPoolData} from "../../models/UserPoolData";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that manages state changes
 */
export class StateChangeService {

  /**
   * login change
   */
  public loginChange: Subject<IconexWallet | BridgeWallet | undefined> = new Subject<IconexWallet | BridgeWallet | undefined>();

  /**
   * Map containing subscribable Subjects for each of the Asset (e.g. USDb, ICX, ..)
   */
  public userBalanceChangeMap: Map<AssetTag, Subject<number>> = new Map([
    [AssetTag.USDS, new Subject<number>()],
    [AssetTag.ICX, new Subject<number>()],
    [AssetTag.USDC, new Subject<number>()],
  ]);

  public userCollateralBalanceChangeMap: Map<CollateralAssetTag, Subject<number>> = new Map([
    [CollateralAssetTag.USDS, new Subject<number>()],
    [CollateralAssetTag.sICX, new Subject<number>()],
    [CollateralAssetTag.USDC, new Subject<number>()],
  ]);

  /**
   * Map containing subscribable Subjects for each of the Asset reserve (e.g. USDb, ICX, ..)
   */
  public userReserveChangeMap: Map<AssetTag, Subject<UserReserveData>> = new Map([
    [AssetTag.USDS, new Subject<UserReserveData>()],
    [AssetTag.ICX, new Subject<UserReserveData>()],
    [AssetTag.USDC, new Subject<UserReserveData>()],
  ]);

  /**
   * Subscribable subject for user account data change
   */
  public userAccountDataChange: Subject<UserAccountData> = new Subject<UserAccountData>();

  public userOmmRewardsChange: Subject<OmmRewards> = new Subject<OmmRewards>();
  public userOmmTokenBalanceDetailsChange: Subject<OmmTokenBalanceDetails> = new Subject<OmmTokenBalanceDetails>();
  public totalOmmStakedChange: Subject<number> = new Subject<number>();

  public yourVotesPrepChange: Subject<YourPrepVote[]> = new Subject<YourPrepVote[]>();
  public prepListChange: Subject<PrepList> = new Subject<PrepList>();

  /**
   * Subscribable subject for monitoring the user modal action changes (supply, withdraw, ..)
   * Example: when user confirms the modal action, this Subject should get updated
   */
  public userModalActionChange: Subject<ModalAction> = new Subject<ModalAction>();
  public userModalActionResult: Subject<ModalActionsResult> = new Subject<ModalActionsResult>();

  /**
   * Subscribable subject for monitoring the user total risk changes
   */
  public userTotalRiskChange: Subject<number> = new Subject<number>();

  /**
   * Subscribable subject for monitoring the pools data
   */
  private poolsDataChange: Subject<PoolData[]> = new Subject<PoolData[]>();
  poolsDataChange$: Observable<PoolData[]> = this.poolsDataChange.asObservable();

  private userPoolsDataChange: Subject<UserPoolData[]> = new Subject<UserPoolData[]>();
  userPoolsDataChange$: Observable<UserPoolData[]> = this.userPoolsDataChange.asObservable();

  private onPoolClick: Subject<UserPoolData | PoolData> = new Subject<UserPoolData | PoolData>();
  onPoolClick$: Observable<UserPoolData | PoolData> = this.onPoolClick.asObservable();

  /**
   * Subscribable subject for monitoring the user debt changes for each asset
   */
  public userDebtMapChange: Map<AssetTag, Subject<number | undefined>> = new Map([
    [AssetTag.USDS, new Subject<number | undefined>()],
    [AssetTag.ICX, new Subject<number | undefined>()],
    [AssetTag.USDC, new Subject<number | undefined>()],
  ]);


  constructor(private persistenceService: PersistenceService) {
    this.userBalanceChangeMap.forEach((subject: Subject<number>, key: AssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.balances.set(key, value);
        }
      });
    });

    this.userCollateralBalanceChangeMap.forEach((subject: Subject<number>, key: CollateralAssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.collateralBalances.set(key, value);
        }
      });
    });

    this.userReserveChangeMap.forEach((subject: Subject<UserReserveData>, assetTag: AssetTag) => {
      subject.subscribe((value: UserReserveData) => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.userReserves.reserveMap.set(assetTag, value);
        }
      });
    });

    this.userDebtMapChange.forEach((subject: Subject<number | undefined>, assetTag: AssetTag) => {
      subject.subscribe((value: number | undefined) => {
        if (this.persistenceService.activeWallet) {
          log.debug(`Loaded asset ${assetTag} debt ${value}...`);
          this.persistenceService.userDebt.set(assetTag, value);
        }
      });
    });
  }

  public poolClickCUpdate(pool: PoolData | UserPoolData): void {
    this.onPoolClick.next(pool);
  }

  public poolsDataUpdate(poolsData: PoolData[]): void {
    this.persistenceService.allPools = [...poolsData];
    this.poolsDataChange.next(poolsData);
  }

  public userPoolsDataUpdate(userPoolsData: UserPoolData[]): void {
    this.persistenceService.userPools = [...userPoolsData];
    this.userPoolsDataChange.next(userPoolsData);
  }

  public updateLoginStatus(wallet: IconexWallet | BridgeWallet | undefined): void {
    this.loginChange.next(wallet);
  }

  public updateUserTotalRisk(totalRisk: number): void {
    this.persistenceService.userTotalRisk = totalRisk;
    this.userTotalRiskChange.next(totalRisk);
  }

  public updateUserAssetBalance(balance: number, assetTag: AssetTag): void {
    this.userBalanceChangeMap.get(assetTag)!.next(balance);
  }

  public updateUserCollateralAssetBalance(balance: number, assetTag: CollateralAssetTag): void {
    this.userCollateralBalanceChangeMap.get(assetTag)!.next(balance);
  }

  public updateUserDebt(debt: number, assetTag: AssetTag): void {
    this.userDebtMapChange.get(assetTag)!.next(debt);
  }

  public updateUserAssetReserve(reserve: UserReserveData, assetTag: AssetTag): void {
    this.userReserveChangeMap.get(assetTag)!.next(reserve);
  }

  public updateUserAccountData(userAccountData: UserAccountData): void {
    this.userAccountDataChange.next(userAccountData);
  }

  public updateUserOmmRewards(userOmmRewards: OmmRewards): void {
    this.userOmmRewardsChange.next(userOmmRewards);
  }

  public updateUserOmmTokenBalanceDetails(userOmmTokenBalanceDetails: OmmTokenBalanceDetails): void {
    this.userOmmTokenBalanceDetailsChange.next(userOmmTokenBalanceDetails);
  }

  public updateUserDelegations(yourVotesPrep: YourPrepVote[]): void {
    this.yourVotesPrepChange.next(yourVotesPrep);
  }

  public updatePrepList(prepList: PrepList): void {
    this.prepListChange.next(prepList);
  }

  public updateTotalStakedOmm(totalStakedOmm: number): void {
    this.totalOmmStakedChange.next(totalStakedOmm);
  }

  public updateUserModalAction(modalAction: ModalAction): void {
    this.userModalActionChange.next(modalAction);
  }

}
