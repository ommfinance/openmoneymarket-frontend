import {Injectable} from '@angular/core';
import {IconexWallet} from '../../models/wallets/IconexWallet';
import {AllAddresses} from '../../models/AllAddresses';
import {AllReservesData, ReserveData} from "../../models/AllReservesData";
import {UserReserveData, UserReserves} from "../../models/UserReserveData";
import {UserAccountData} from "../../models/UserAccountData";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {AssetTag} from "../../models/Asset";
import {AllReserveConfigData} from "../../models/AllReserveConfigData";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import {OmmRewards} from "../../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that holds and manages client data.
 */
export class PersistenceService {

  public activeWallet?: IconexWallet | BridgeWallet | LedgerWallet;

  public allAddresses?: AllAddresses;
  public allReserves?: AllReservesData;
  public allReservesConfigData?: AllReserveConfigData;

  public userReserves: UserReserves = new UserReserves();
  public userTotalRisk = 0;

  public userAccountData?: UserAccountData;
  public userOmmRewards?: OmmRewards;
  public userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  public tokenDistributionPerDay = 1;
  public loanOriginationFeePercentage = 0.001;

  constructor() {}

  public userLoggedIn(): boolean {
    return this.activeWallet != null;
  }

  publicGetActiveIconAddress(): string | undefined {
    return this.activeWallet?.address;
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

  public getUserAssetBalance(assetTag: AssetTag): number {
    return this.activeWallet?.balances.get(assetTag) ?? 0;
  }

  public getUserAssetUSDBalance(assetTag: AssetTag): number {
    const balance = this.activeWallet?.balances.get(assetTag) ?? 0;
    const exchangePrice = this.getAssetExchangePrice(assetTag) ?? 0;
    return balance * exchangePrice;
  }

  public getAssetExchangePrice(assetTag: AssetTag): number {
    return this.getAssetReserveData(assetTag)?.exchangePrice ?? 0;
  }

  public sIcxToIcxRate(): number {
    return this.getAssetReserveData(AssetTag.ICX)?.sICXRate ?? 1;
  }

  public getUserSuppliedAssetBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalance ?? 0;
  }

  public getUserSuppliedAssetUSDBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalanceUSD ?? 0;
  }

  public getUserBorrowedAssetBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalance ?? 0;
  }

  public getUserBorrowedAssetUSDBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalanceUSD ?? 0;
  }

  public getUserIcxBalance(): number {
    return this.activeWallet?.balances.get(AssetTag.ICX) ?? 0;
  }

  public getUserSuppliedIcxBalance(): number {
    return this.userReserves?.reserveMap.get(AssetTag.ICX)?.currentOTokenBalance ?? 0;
  }

  public getUserAssetReserve(assetTag: AssetTag): UserReserveData | undefined {
    return this.userReserves?.reserveMap.get(assetTag);
  }

  public getUserUSDbReserve(): UserReserveData | undefined {
    return this.userReserves?.reserveMap.get(AssetTag.USDb);
  }

  public getUserIcxReserve(): UserReserveData | undefined {
    return this.userReserves?.reserveMap.get(AssetTag.ICX);
  }

  public getAssetReserveData(assetTag: AssetTag): ReserveData | undefined {
    return this.allReserves?.getReserveData(assetTag);
  }

  public getTotalSuppliedUSD(): number {
    let totalSupplied = 0;
    if (!this.allReserves) {
      return totalSupplied;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalSupplied += property.totalLiquidityUSD;
    });
    return totalSupplied;
  }

  public getTotalBorrowedUSD(): number {
    let totalBorrowed = 0;
    if (!this.allReserves) {
      return totalBorrowed;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalBorrowed += property.totalBorrowsUSD;
    });
    return totalBorrowed;
  }

  public getUserTotalSupplied(): number {
    let totalSupplied = 0;
    if (!this.userReserves) {
      return totalSupplied;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalSupplied += reserve?.currentOTokenBalance ?? 0;
    });
    return totalSupplied;
  }

  public getUserTotalSuppliedUSD(): number {
    let totalSupplied = 0;
    if (!this.userReserves) {
      return totalSupplied;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalSupplied += reserve?.currentOTokenBalanceUSD ?? 0;
    });
    return totalSupplied;
  }

  public getUserTotalBorrowedUSD(): number {
    let totalBorrowed = 0;
    if (!this.userReserves) {
      return totalBorrowed;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalBorrowed += reserve?.currentBorrowBalanceUSD ?? 0;
    });
    return totalBorrowed;
  }

  public getUserAvgSupplyApy(): number {
    let counter = 0;
    let total = 0;

    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      total += reserve?.liquidityRate ?? 0;
      counter++;
    });

    return counter === 0 || total === 0 ? 0 : total / counter;
  }

  public getUserAvgBorrowApy(): number {
    let counter = 0;
    let total = 0;

    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      total += reserve?.borrowRate ?? 0;
      counter++;
    });

    return counter === 0 || total === 0 ? 0 : total / counter;
  }

  public getMySupplyApy(): number {
    let supplyApySum = 0;
    let supplySum = 0;
    let supplied;
    let supplyApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.userReserves!.reserveMap.forEach(reserve => {
      supplied = reserve?.currentOTokenBalance ?? 0;
      supplyApy = reserve?.liquidityRate ?? 0;
      supplyApySum += supplied * supplyApy;
      supplySum += supplied;
    });


    return supplyApySum / supplySum;
  }

  public getMyBorrowApy(): number {
    let borrowApySum = 0;
    let borrowSum = 0;
    let borrowed;
    let borrowApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.userReserves!.reserveMap.forEach(reserve => {
      borrowed = reserve?.currentBorrowBalance ?? 0;
      borrowApy = reserve?.borrowRate ?? 0;
      borrowApySum += borrowed * borrowApy;
      borrowSum += borrowed;
    });


    return borrowApySum / borrowSum;
  }

  public getAverageLiquidationThreshold(): number {
    let counter = 0;
    let total = 0;

    if (!this.allReserves) {
      return total;
    }

    Object.values(this.allReserves!).forEach((property: ReserveData) => {
      total += property.liquidationThreshold;
      counter++;
    });
    return total / counter;
  }

  public userHasNotBorrowedAnyAsset(): boolean {
    for (const value of this.userReserves!.reserveMap.values()) {
      if (value && value!.currentBorrowBalance > 0) {
        return false;
      }
    }
    return true;
  }

  public userHasNotSuppliedAnyAsset(): boolean {
    for (const value of this.userReserves!.reserveMap.values()) {
      if (value && value!.currentOTokenBalance > 0) {
        return false;
      }
    }
    return true;
  }

  public userAssetSuppliedOrBorrowedNotZero(assetTag: AssetTag): boolean {
    return !this.userAssetSuppliedIsZero(assetTag) || !this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetSuppliedAndBorrowedIsZero(assetTag: AssetTag): boolean {
    return this.userAssetSuppliedIsZero(assetTag) && this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetWalletSupplyAndBorrowIsZero(assetTag: AssetTag): boolean {
    // If asset-user wallet, supply, and borrow balance = 0
    return this.userAssetBalanceIsZero(assetTag)
      && this.userAssetSuppliedIsZero(assetTag)
      && this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetSuppliedIsZero(assetTag: AssetTag): boolean {
    return (this.getUserSuppliedAssetBalance(assetTag) ?? 0) === 0;
  }

  isAssetAvailable(assetTag: AssetTag): boolean {
    const supplied = this.getUserSuppliedAssetBalance(assetTag) ?? 0;
    const balance = this.getUserAssetBalance(assetTag) ?? 0;

    return supplied === 0 && balance > 0;
  }

  public userAssetBorrowedIsZero(assetTag: AssetTag): boolean {
    return (this.getUserBorrowedAssetBalance(assetTag) ?? 0) === 0;
  }

  public userAssetBalanceIsZero(assetTag: AssetTag): boolean {
    return (this.activeWallet?.balances.get(assetTag) ?? 0) === 0;
  }

  public isAssetSuppliedBorrowedBalanceZero(assetTag: AssetTag): boolean {
    return this.userAssetSuppliedIsZero(assetTag)
      && this.userAssetBorrowedIsZero(assetTag)
      && this.userAssetBalanceIsZero(assetTag);
  }

  public isAssetAvailableToSupply(assetTag: AssetTag): boolean {
    // if user has not supplied or the asset and has balance of it > 0
    return this.userAssetSuppliedIsZero(assetTag)
      && !this.userAssetBalanceIsZero(assetTag);
  }

  // asset is active if is either supplied, borrowed or available to borrow
  public isAssetActive(assetTag: AssetTag): boolean {
    return !this.userAssetSuppliedIsZero(assetTag)
      || !this.userAssetBorrowedIsZero(assetTag);
  }

}
