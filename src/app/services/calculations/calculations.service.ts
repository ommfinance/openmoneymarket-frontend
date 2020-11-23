import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {LTV} from "../../common/constants";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(private persistenceService: PersistenceService) { }

  public calculateSliderAvailableUSDbSupply(userSliderSuppliedUSDbValue: number): number {
    return (this.persistenceService.iconexWallet?.balances.USDb ?? 15000) +
      ((this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 0) - userSliderSuppliedUSDbValue);
  }

  public calculateSliderAvailableUSDbBorrow(userSliderBorrowedUSDbValue: number): number {
    return ((this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000) * LTV) - userSliderBorrowedUSDbValue;
  }

  public calculateUSDbBorrowSliderMax(): number {
    return ((this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000) * LTV);
  }
}
