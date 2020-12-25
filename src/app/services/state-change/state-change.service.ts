import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {Reserve} from "../../interfaces/reserve";
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that manages state changes
 */
export class StateChangeService {

  /**
   * Map containing subscribable Subjects for each of the Asset (e.g. USDb, ICX, ..)
   */
  public userBalanceChangeMap: Map<AssetTag, Subject<number>> = new Map([
    [AssetTag.USDb, new Subject<number>()],
    [AssetTag.ICX, new Subject<number>()],
  ]);

  /**
   * Map containing subscribable Subjects for each of the Asset reserve (e.g. USDb, ICX, ..)
   */
  public userReserveChangeMap: Map<AssetTag, Subject<Reserve>> = new Map([
    [AssetTag.USDb, new Subject<Reserve>()],
    [AssetTag.ICX, new Subject<Reserve>()],
  ]);

  constructor(private persistenceService: PersistenceService) {
    this.userBalanceChangeMap.forEach((subject: Subject<number>, key: AssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.balances.set(key, value);
        }
      });
    });

    this.userReserveChangeMap.forEach((subject: Subject<Reserve>, key: AssetTag) => {
      subject.subscribe((value: Reserve) => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.userReserves!.reserveMap.set(key, value);
        }
      });
    });
  }

  public updateUserUSDbBalance(balance: number): void {
    this.userBalanceChangeMap.get(AssetTag.USDb)!.next(balance);
  }

  public updateUserUSDbReserve(reserve: Reserve): void {
    this.userReserveChangeMap.get(AssetTag.USDb)!.next(reserve);
  }

  public updateUserIcxBalance(balance: number): void {
    this.userBalanceChangeMap.get(AssetTag.ICX)!.next(balance);
  }

  public updateUserIcxReserve(reserve: Reserve): void {
    this.userReserveChangeMap.get(AssetTag.ICX)!.next(reserve);
  }
}
