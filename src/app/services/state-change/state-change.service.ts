import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {Reserve} from "../../interfaces/reserve";
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";
import {IconexWallet} from "../../models/IconexWallet";
import {BridgeWallet} from "../../models/BridgeWallet";
import {CalculationsService} from "../calculations/calculations.service";

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
  public userReserveChangeMap: Map<AssetTag, Subject<Reserve>> = new Map([
    [AssetTag.USDb, new Subject<Reserve>()],
    [AssetTag.ICX, new Subject<Reserve>()],
  ]);

  constructor(private persistenceService: PersistenceService,
              private calculationService: CalculationsService) {
    this.userBalanceChangeMap.forEach((subject: Subject<number>, key: AssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.balances.set(key, value);
        }
      });
    });

    this.userReserveChangeMap.forEach((subject: Subject<Reserve>, assetTag: AssetTag) => {
      subject.subscribe((value: Reserve) => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.userReserves!.reserveMap.set(assetTag, value);
          // update user total risk
          // this.userTotalRiskChange.next(this.calculationService.calculateValueRiskTotal(assetTag));
        }
      });
    });

    // this.userTotalRiskChange.subscribe(totalRisk => this.persistenceService.userTotalRisk = totalRisk);
  }

  public updateLoginStatus(wallet: IconexWallet | BridgeWallet | undefined): void {
    this.loginChange.next(wallet);
  }

  public updateUserAssetBalance(balance: number, assetTag: AssetTag): void {
    this.userBalanceChangeMap.get(assetTag)!.next(balance);
  }

  public updateUserAssetReserve(reserve: Reserve, assetTag: AssetTag): void {
    this.userReserveChangeMap.get(assetTag)!.next(reserve);
  }

}
