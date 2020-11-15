import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class MockScoreService {

  // user variables
  // USDb i.e. Bridge Dollars variables
  public userSuppliedUSD = 120690; // i.e. userLiquidityUSD
  public userSuppliedUSDb = 120690;
  public userBorrowedUSD = 11840; // i.e. userBorrowUSD

  // USDb i.e. Bridge Dollars variables
  public totalSuppliedUSD = 843792; // i.e. totalLiquidityUSD
  public totalBorrowedUSD = 379564; // i.e. totalBorrowUSD

  public totalBorrowedUSDb = 11840;
  public supplyApy = 6.47; // i.e. liquidityRate USDb?
  public borrowApy = 7.25; // i.e. borrowRate USDb?


  constructor() {
    this.resetState();
  }

  public resetState(): void {
    this.userSuppliedUSD = 120690;
    this.userSuppliedUSDb = 120690;
    this.userBorrowedUSD = 11840;
    this.totalBorrowedUSDb = 11840;
    this.supplyApy = 6.47;
    this.borrowApy = 7.25;
  }

  public getAllAddresses(): any {
    return {
      collateral: {
        USDb: "cx19584dcfacd0d7cc5e0562a53959069213d7adca",
        sICX: "cx19584dcfacd0d7cc5e0562a53959069213d7adca",
      },
      oTokens: {
        oICX: "cx19584dcfacd0d7cc5e0562a53959069213d7adca",
        oUSDb: "cx19584dcfacd0d7cc5e0562a53959069213d7adca"
      },
      systemContract: {
        LendingPool: "cx19584dcfacd0d7cc5e0562a53959069213d7adca",
        LendingPoolDataProvider: "cx19584dcfacd0d7cc5e0562a53959069213d7adca"
      }
    };
  }

}
