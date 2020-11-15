import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves} from "../../interfaces/all-reserves";
import {UserUSDbReserve} from "../../interfaces/user-usdb-reserve";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet: IconWallet | undefined;
  public allAddresses: AllAddresses | undefined;
  public allReserves: AllReserves | undefined;
  public userUSDbReserve: UserUSDbReserve | undefined;

  public userUSDbBalanceChange: Subject<number> = new Subject<number>();
  public userUSDbReserveChange: Subject<UserUSDbReserve> = new Subject<UserUSDbReserve>();

  constructor() {
    this.userUSDbBalanceChange.subscribe(value => {
      if (this.iconexWallet) {
        this.iconexWallet.balances.USDb = value;
      }
    })
    this.userUSDbReserveChange.subscribe(value => {
      this.userUSDbReserve = value;
    })
  }

  public updateUserUSDbBalance(balance: number) {
    this.userUSDbBalanceChange.next(balance);
  }

  public updateUserUSDbReserve(userUSDbReserve: UserUSDbReserve) {
    this.userUSDbReserveChange.next(userUSDbReserve);
  }

  public iconexLogin(iconWallet: IconWallet): void {
    this.iconexWallet = iconWallet;
    localStorage.setItem('IconWallet', JSON.stringify(iconWallet));
  }

  public iconexLogout(): void {
    this.iconexWallet = undefined;
    localStorage.removeItem('IconWallet');
  }

  public isIconexWalletConnected(): boolean {
    return this.iconexWallet != null;
  }

}
