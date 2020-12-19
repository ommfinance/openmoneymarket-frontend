import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves, ReserveData} from "../../interfaces/all-reserves";
import {Reserve} from "../../interfaces/reserve";
import {Subject} from "rxjs";
import {UserAccountData} from "../../models/user-account-data";
// import {BridgeService} from "icon-bridge-sdk/build/lib/BridgeService";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet?: IconWallet;
  // public bridgeInstance?: BridgeService;

  public allAddresses?: AllAddresses;
  public allReserves?: AllReserves;

  public userUSDbReserve?: Reserve;
  public userIcxReserve?: Reserve;

  public userUSDbBalanceChange: Subject<number> = new Subject<number>();
  public userUSDbReserveChange: Subject<Reserve> = new Subject<Reserve>();

  public userIcxBalanceChange: Subject<number> = new Subject<number>();
  public userIcxReserveChange: Subject<Reserve> = new Subject<Reserve>();

  public userAccountData?: UserAccountData;

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

  public getUserUSDbBalance(): number {
    return this.iconexWallet?.balances.USDb ?? 0;
  }

  public getUserSuppliedUSDbBalance(): number {
    return this.userUSDbReserve?.currentOTokenBalance ?? 0;
  }

  public getUserBorrowedUSDbBalance(): number {
    return this.userUSDbReserve?.principalBorrowBalance ?? 0;
  }

  public getUserIcxBalance(): number {
    return this.iconexWallet?.balances.ICX ?? 0;
  }

  public getUserSuppliedIcxBalance(): number {
    return this.userIcxReserve?.currentOTokenBalance ?? 0;
  }

  public getTotalSupplied(): number {
    let totalSupplied = 0;
    if (!this.allReserves) {
      return totalSupplied;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalSupplied += property.totalLiquidity;
    });
    return totalSupplied;
  }

  public getTotalBorrowed(): number {
    let totalBorrowed = 0;
    if (!this.allReserves) {
      return totalBorrowed;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalBorrowed += property.totalBorrows;
    });
    return totalBorrowed;
  }

  public getAvgSupplyApy(): number {
    let counter = 0;
    let total = 0;
    if (!this.allReserves) {
      return total;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      total += property.liquidityRate;
      counter++;
    });
    return total / counter;
  }

  public getAvgBorrowApy(): number {
    let counter = 0;
    let total = 0;
    if (!this.allReserves) {
      return total;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      total += property.borrowRate;
      counter++;
    });
    return total / counter;
  }

  public getWalletValue(): number {
    // TODO consider all balances and reserves, for now just USDb
    return (this.iconexWallet?.balances.USDb ?? 0) + (this.userUSDbReserve?.currentOTokenBalance ?? 0);
  }

}
