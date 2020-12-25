import {Injectable} from '@angular/core';
import {IconexWallet} from '../../models/IconexWallet';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves, ReserveData} from "../../interfaces/all-reserves";
import {Reserve, UserReserves} from "../../interfaces/reserve";
import {UserAccountData} from "../../models/user-account-data";
import {BridgeWallet} from "../../models/BridgeWallet";
import {AssetTag} from "../../models/Asset";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that holds and manages client data.
 */
export class PersistenceService {

  public activeWallet?: IconexWallet | BridgeWallet;

  public allAddresses?: AllAddresses;
  public allReserves?: AllReserves;

  public userReserves?: UserReserves;

  public userAccountData?: UserAccountData;

  constructor() {}

  public walletLogin(wallet: IconexWallet | BridgeWallet): void {
    this.activeWallet = wallet;
  }

  public walletLogout(): void {
    this.activeWallet = undefined;
  }

  public userLoggedIn(): boolean {
    return this.activeWallet != null;
  }

  public bridgeWalletActive(): boolean {
    return this.activeWallet instanceof BridgeWallet;
  }

  public iconexWalletActive(): boolean {
    return this.activeWallet instanceof IconexWallet;
  }

  public getUserUSDbBalance(): number {
    return this.activeWallet?.balances.get(AssetTag.USDb) ?? 0;
  }

  public getUserSuppliedAssetBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalance ?? 0;
  }

  public getUserAssetBorrowedBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.principalBorrowBalance ?? 0;
  }

  public getUserSuppliedUSDbBalance(): number {
    return this.userReserves?.reserveMap.get(AssetTag.USDb)?.currentOTokenBalance ?? 0;
  }

  public getUserBorrowedUSDbBalance(): number {
    return this.userReserves?.reserveMap.get(AssetTag.USDb)?.principalBorrowBalance ?? 0;
  }

  public getUserIcxBalance(): number {
    return this.activeWallet?.balances.get(AssetTag.ICX) ?? 0;
  }

  public getUserSuppliedIcxBalance(): number {
    return this.userReserves?.reserveMap.get(AssetTag.ICX)?.currentOTokenBalance ?? 0;
  }

  public getUserAssetReserve(assetTag: AssetTag): Reserve | undefined {
    return this.userReserves?.reserveMap.get(assetTag);
  }

  public getUserUSDbReserve(): Reserve | undefined {
    return this.userReserves?.reserveMap.get(AssetTag.USDb);
  }

  public getUserIcxReserve(): Reserve | undefined {
    return this.userReserves?.reserveMap.get(AssetTag.ICX);
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

}
