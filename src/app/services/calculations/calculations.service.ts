import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {LTV} from "../../common/constants";
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
    return ((this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV) - currentAssetBorrowed;
  }

  public calculateAssetBorrowSliderMax(assetTag: AssetTag): number {
    return ((this.persistenceService.getUserSuppliedAssetBalance(assetTag) ?? 10000) * LTV);
  }
}
