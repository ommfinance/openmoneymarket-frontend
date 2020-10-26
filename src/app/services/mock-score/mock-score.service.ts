import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MockScoreService {

  // USDb i.e. Bridge Dollars variables
  public userSuppliedUSD = 120690; // i.e. userLiquidityUSD
  public totalSuppliedUSD = 843792; // i.e. totalLiquidityUSD
  public totalSuppliedUSDb = 120690;
  public userBorrowedUSD = 11840; // i.e. userBorrowUSD
  public totalBorrowedUSD = 379564; // i.e. totalBorrowUSD
  // totalBorrowedUSD
  public totalBorrowedUSDb = 11840;
  public supplyApy = 6.47; // i.e. liquidityRate USDb?
  public borrowApy = 7.25; // i.e. borrowRate USDb?


  constructor() {
    this.resetState();
  }

  public resetState(): void {
    this.userSuppliedUSD = 120690;
    this.totalSuppliedUSDb = 120690;
    this.userBorrowedUSD = 11840;
    this.totalBorrowedUSDb = 11840;
    this.supplyApy = 6.47;
    this.borrowApy = 7.25;
  }

  /** Deposit USDb flow:
   * 1. Call to AddressProvider SCORE -> getAllAddresses and extract USDb SCORE address (Bridge SCORE)
   * 2. Call USDb SCORE transfer to lending pool SCORE
   **/
  public depositUSDb(amount: number): void {
      const allAddresses = this.getAllAddresses();
      const USDbAddress = allAddresses.collateral.USDb;

      this.transferToUSDbScore(USDbAddress, amount);

  }

  public transferToUSDbScore(USDbScoreAddress: string, amount: number): void {
    this.totalSuppliedUSDb += +amount;
    // TODO increase supplyApy
  }

  public getAllAddresses(): any {
    return {
      collateral: {
        USDb: "0xc..",
        sICX: "0xc..",
      },
      oTokens: {
        oICX: "0xc..",
        oUSDb: "0xc.."
      },
      systemContract: {
        LendingPool: "0xc..",
        LendingPoolDataProvider: "0xc.."
      }
    };
  }


}
