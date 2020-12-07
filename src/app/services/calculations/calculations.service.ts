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

  public calculateSliderAvailableIcxSupply(userSliderSuppliedIcxValue: number): number {
    return (this.persistenceService.iconexWallet?.balances.ICX ?? 15000) +
      ((this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 0) - userSliderSuppliedIcxValue);
  }

  public calculateSliderAvailableUSDbBorrow(userSliderBorrowedUSDbValue: number): number {
    return ((this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000) * LTV) - userSliderBorrowedUSDbValue;
  }

  public calculateSliderAvailableIcxBorrow(userSliderBorrowedIcxValue: number): number {
    console.log("calculateSliderAvailableIcxBorrow->userSliderBorrowedIcxValue=" + userSliderBorrowedIcxValue);
    return ((this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 10000) * LTV) - userSliderBorrowedIcxValue;
  }

  public calculateUSDbBorrowSliderMax(): number {
    return ((this.persistenceService.userUSDbReserve?.currentOTokenBalance ?? 10000) * LTV);
  }

  public calculateIcxBorrowSliderMax(): number {
    return ((this.persistenceService.userIcxReserve?.currentOTokenBalance ?? 10000) * LTV);
  }
}
