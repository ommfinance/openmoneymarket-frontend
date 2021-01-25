import {Injectable} from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  className = "[CalculationsService]";

  constructor(private persistenceService: PersistenceService) { }

  public calculateAssetSliderAvailableSupply(currentAssetSupplied: number, assetTag: AssetTag): number {
    return (this.persistenceService.activeWallet?.balances.get(assetTag) ?? 0) +
      ((this.persistenceService.getUserSuppliedAssetBalance(assetTag)) - currentAssetSupplied);
  }

  public calculateAssetSupplySliderMax(assetTag: AssetTag): number {
    return this.persistenceService.getUserSuppliedAssetBalance(assetTag) + this.persistenceService.getUserAssetBalance(assetTag);
  }

  // OLD AVAILABLE BORROW LOGIC TODO: remove after not needed
  // public calculateAssetSliderAvailableBorrow(currentAssetBorrowed: number, assetTag: AssetTag): number {
  //   const LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(assetTag).baseLTVasCollateral ?? 0;
  //   return ((this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV) - currentAssetBorrowed;
  // }

  // public calculateAssetBorrowSliderMax(assetTag: AssetTag): number {
  //   const LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(assetTag).baseLTVasCollateral ?? 0;
  //   return (this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV;
  // }

  // calculate the total risk percentage based on the user health factor
  public calculateTotalRiskPercentage(): number {
    // if user has not borrowed any asset return 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      return 0;
    } else {
      const healthFactor = this.persistenceService.userAccountData?.healthFactor ?? 1;

      // check for negative health factor
      if (healthFactor <= 0) {
        return 0;
      }

      const totalRiskPercentage = 1 / healthFactor * 100;
      log.debug(`${this.className} calculateTotalRiskPercentage-> healthFactor = ${this.persistenceService.userAccountData?.healthFactor}`);
      log.debug(`${this.className} calculateTotalRiskPercentage-> totalRiskPercentage = ${totalRiskPercentage}`);
      return totalRiskPercentage;
    }
  }

  public calculateValueRiskTotal(assetTag?: AssetTag, supplyDiff?: number, borrowDiff?: number): number {
    return -1;
    // TODO
    // const totalBorrowed = borrowDiff ? this.persistenceService.getUserTotalBorrowed() - borrowDiff
    //   : this.persistenceService.getUserTotalBorrowed();
    // let totalSuppliedWithLtv = 0;
    // let LTV = 0;
    // this.persistenceService.userReserves.reserveMap.forEach((reserve, tag) => {
    //   LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(tag).baseLTVasCollateral ?? 0;
    //   if (supplyDiff && assetTag === tag) {
    //     totalSuppliedWithLtv += this.persistenceService.getUserSuppliedAssetBalance(tag) - supplyDiff;
    //   } else {
    //     totalSuppliedWithLtv += this.persistenceService.getUserSuppliedAssetBalance(tag);
    //   }
    // });
    //
    // return totalBorrowed / (totalSuppliedWithLtv) * 100;
  }

  /**
   * @description Calculate the available borrow for specific asset (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return asset available borrow amount
   */
  public calculateAvailableBorrowForAsset(assetTag: AssetTag): number {
    log.debug("calculateAvailableBorrowForAsset:");
    // average across all reserves
    const currentLTV = this.persistenceService.userAccountData?.currentLtv ?? 0;
    log.debug("currentLTV:" + currentLTV);

    const totalCollateralBalanceUSD = this.persistenceService.userAccountData?.totalCollateralBalanceUSD ?? 0;
    log.debug("totalCollateralBalanceUSD:" + totalCollateralBalanceUSD);

    const totalFeesUSD = this.persistenceService.userAccountData?.totalFeesUSD ?? 0;
    log.debug("totalFeesUSD:" + totalFeesUSD);


    const borrowsAllowedUSD = (totalCollateralBalanceUSD - totalFeesUSD) * currentLTV;
    log.debug("borrowsAllowedUSD:" + borrowsAllowedUSD);
    // previous borrow balance of user across all collaterals in USD
    const totalBorrowBalanceUSD = this.persistenceService.userAccountData?.totalBorrowBalanceUSD ?? 0;
    log.debug("totalBorrowBalanceUSD:" + totalBorrowBalanceUSD);
    // the amount user can borrow in USD across all the collaterals
    const availableBorrowUSD = borrowsAllowedUSD - totalBorrowBalanceUSD;
    log.debug("availableBorrowUSD:" + availableBorrowUSD);
    // exchange price of the asset (reserve) extracted from the ReserveData
    const exchangePrice = this.persistenceService.getAssetReserveData(assetTag)?.exchangePrice ?? 0.54321;
    log.debug(`exchangePrice for ${assetTag} = ${exchangePrice}`);

    // return availableBorrowUSD / exchangePrice;
    return availableBorrowUSD / exchangePrice;
  }

  /**
   * @description Calculate users daily supply interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param currentSupplied - optional parameter to provide current supplied value (e.g. for dynamic slider changes)
   * @return users asset supply interest (in USD) for a day
   */
  public calculateUsersDailySupplyInterestForAsset(assetTag: AssetTag, currentSupplied?: number): number {
    let currentOTokenBalanceUSD;
    if (currentSupplied) {
      // multiply supplied with the price of asset to get USD value
      currentOTokenBalanceUSD = currentSupplied * this.persistenceService.getAssetExchangePrice(assetTag);
    } else {
      currentOTokenBalanceUSD = currentSupplied ?? this.persistenceService.getUserSuppliedAssetUSDBalance(assetTag);
    }
    const liquidityRate = this.persistenceService.getAssetReserveData(assetTag)?.liquidityRate ?? 0;
    // "easy route" formula
    return currentOTokenBalanceUSD * liquidityRate * (1 / 356);
  }

  /**
   * @description Calculate users daily borrow interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param currentBorrowed - optional parameter to provide current borrowed value (e.g. for dynamic slider changes)
   * @return users asset borrow interest (in USD) for a day
   */
  public calculateUsersDailyBorrowInterestForAsset(assetTag: AssetTag, currentBorrowed?: number): number {
    let currentBorrowBalanceUSD;
    if (currentBorrowed) {
      currentBorrowBalanceUSD = currentBorrowed * this.persistenceService.getAssetExchangePrice(assetTag);
    } else {
      currentBorrowBalanceUSD = this.persistenceService.getUserBorrowedAssetUSDBalance(assetTag);
    }
    const borrowRate = this.persistenceService.getAssetReserveData(assetTag)?.borrowRate ?? 0;
    // "easy route" formula
    return currentBorrowBalanceUSD * borrowRate * (1 / 356);
  }

  /**
   * @description Calculate users OMM rewards for deposit of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return users Omm reward for deposit amount
   */
  public calculateUsersOmmRewardsForDeposit(assetTag: AssetTag): number {
    // TODO clear out that part
    return -1;
  }

  /**
   * @description Calculate users OMM rewards for borrow of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return users Omm reward for borrow amount
   */
  public calculateUsersOmmRewardsForBorrow(assetTag: AssetTag): number {
    // TODO clear out that part
    return -1;
  }

}
