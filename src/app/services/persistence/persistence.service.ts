import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves} from "../../interfaces/all-reserves";
import {Reserve} from "../../interfaces/reserve";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet: IconWallet | undefined;
  public allAddresses: AllAddresses | undefined;
  public allReserves: AllReserves | undefined;

  public userUSDbReserve: Reserve | undefined;
  public userIcxReserve: Reserve | undefined;

  public userUSDbBalanceChange: Subject<number> = new Subject<number>();
  public userUSDbReserveChange: Subject<Reserve> = new Subject<Reserve>();

  public userIcxBalanceChange: Subject<number> = new Subject<number>();
  public userIcxReserveChange: Subject<Reserve> = new Subject<Reserve>();

  constructor() {
    this.userUSDbBalanceChange.subscribe(value => {
      if (this.iconexWallet) {
        this.iconexWallet.balances.USDb = value;
      }
    });
    this.userUSDbReserveChange.subscribe(value => {
      this.userUSDbReserve = value;
    });
    this.userIcxBalanceChange.subscribe(value => {
      if (this.iconexWallet) {
        this.iconexWallet.balances.ICX = value;
      }
    });
    this.userIcxReserveChange.subscribe(value => {
      this.userIcxReserve = value;
    });
  }

  public updateUserUSDbBalance(balance: number): void {
    this.userUSDbBalanceChange.next(balance);
  }

  public updateUserUSDbReserve(reserve: Reserve): void {
    this.userUSDbReserveChange.next(reserve);
  }

  public updateUserIcxBalance(balance: number): void {
    this.userIcxBalanceChange.next(balance);
  }

  public updateUserIcxReserve(reserve: Reserve): void {
    this.userIcxReserveChange.next(reserve);
  }

  public iconexLogin(iconWallet: IconWallet): void {
    this.iconexWallet = iconWallet;
    localStorage.setItem('IconWallet', JSON.stringify(iconWallet));
  }

  public iconexLogout(): void {
    this.iconexWallet = undefined;
    localStorage.removeItem('IconWallet');
  }

  public userLoggedIn(): boolean {
    return this.iconexWallet != null;
  }

}
