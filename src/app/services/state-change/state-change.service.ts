import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {UserReserveData} from "../../models/UserReserveData";
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {UserAccountData} from "../../models/UserAccountData";
import {ModalAction} from "../../models/ModalAction";

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
    [AssetTag.USDb, new Subject<number>()],
    [AssetTag.ICX, new Subject<number>()],
  ]);

  // public userTotalRiskChange: Subject<number> = new Subject<number>();

  /**
   * Map containing subscribable Subjects for each of the Asset reserve (e.g. USDb, ICX, ..)
   */
  public userReserveChangeMap: Map<AssetTag, Subject<UserReserveData>> = new Map([
    [AssetTag.USDb, new Subject<UserReserveData>()],
    [AssetTag.ICX, new Subject<UserReserveData>()],
  ]);

  /**
   * Subscribable subject for user account data change
   */
  public userAccountDataChange: Subject<UserAccountData> = new Subject<UserAccountData>();

  /**
   * Subscribable subject for monitoring the user modal action changes (supply, withdraw, ..)
   * Example: when user confirms the modal action, this Subject should get updated
   */
  public userModalActionChange: Subject<ModalAction> = new Subject<ModalAction>();

  /**
   * Subscribable subject for monitoring the user total risk changes
   */
  public userTotalRiskChange: Subject<number> = new Subject<number>();


  constructor(private persistenceService: PersistenceService) {
    this.userBalanceChangeMap.forEach((subject: Subject<number>, key: AssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.balances.set(key, value);
        }
      });
    });

    this.userReserveChangeMap.forEach((subject: Subject<UserReserveData>, assetTag: AssetTag) => {
      subject.subscribe((value: UserReserveData) => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.userReserves!.reserveMap.set(assetTag, value);
        }
      });
    });
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

  public updateUserAssetReserve(reserve: UserReserveData, assetTag: AssetTag): void {
    this.userReserveChangeMap.get(assetTag)!.next(reserve);
  }

  public updateUserAccountData(userAccountData: UserAccountData): void {
    this.userAccountDataChange.next(userAccountData);
  }

  public updateUserModalAction(modalAction: ModalAction): void {
    this.userModalActionChange.next(modalAction);
  }

}
