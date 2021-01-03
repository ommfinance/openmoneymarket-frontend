import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(private persistenceService: PersistenceService) { }

  public calculateAssetSliderAvailableSupply(currentAssetSupplied: number, assetTag: AssetTag): number {
    return (this.persistenceService.activeWallet?.balances.get(assetTag) ?? 15000) +
      ((this.persistenceService.getUserSuppliedAssetBalance(assetTag)) - currentAssetSupplied);
  }

  public calculateAssetSliderAvailableBorrow(currentAssetBorrowed: number, assetTag: AssetTag): number {
    const LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(assetTag).baseLTVasCollateral ?? 0;
    return ((this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV) - currentAssetBorrowed;
  }

  public calculateAssetBorrowSliderMax(assetTag: AssetTag): number {
    const LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(assetTag).baseLTVasCollateral ?? 0;
    return (this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV;
  }

  public calculateValueRiskTotal(assetTag?: AssetTag, supplyDiff?: number, borrowDiff?: number): number {
    const totalBorrowed = borrowDiff ? this.persistenceService.getUserTotalBorrowed() - borrowDiff
      : this.persistenceService.getUserTotalBorrowed();
    let totalSuppliedWithLtv = 0;
    let LTV = 0;
    this.persistenceService.userReserves.reserveMap.forEach((reserve, tag) => {
      LTV = this.persistenceService.allReservesConfigData?.getReserveConfigData(tag).baseLTVasCollateral ?? 0;
      if (supplyDiff && assetTag === tag) {
        totalSuppliedWithLtv += this.persistenceService.getUserSuppliedAssetBalance(tag) - supplyDiff;
      } else {
        totalSuppliedWithLtv += this.persistenceService.getUserSuppliedAssetBalance(tag);
      }
    });

    return totalBorrowed / (totalSuppliedWithLtv) * 100;
  }
}
