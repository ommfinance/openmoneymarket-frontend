export class UserAccountData {
  borrowingPower: number;
  currentLiquidationThreshold: number;
  currentLtv: number;
  healthFactor: number;
  healthFactorBelowThreshold: number;
  totalBorrowBalanceUSD: number;
  totalCollateralBalanceUSD: number;
  totalFeesUSD: number;
  totalLiquidityBalanceUSD: number;


  constructor(borrowingPower: number, currentLiquidationThreshold: number, currentLtv: number, healthFactor: number,
              healthFactorBelowThreshold: number, totalBorrowBalanceUSD: number, totalCollateralBalanceUSD: number,
              totalFeesUSD: number, totalLiquidityBalanceUSD: number) {
    this.borrowingPower = borrowingPower;
    this.currentLiquidationThreshold = currentLiquidationThreshold;
    this.currentLtv = currentLtv;
    this.healthFactor = healthFactor;
    this.healthFactorBelowThreshold = healthFactorBelowThreshold;
    this.totalBorrowBalanceUSD = totalBorrowBalanceUSD;
    this.totalCollateralBalanceUSD = totalCollateralBalanceUSD;
    this.totalFeesUSD = totalFeesUSD;
    this.totalLiquidityBalanceUSD = totalLiquidityBalanceUSD;
  }
}

// example
// borrowingPower: "0x0"
// currentLiquidationThreshold: "0x0"
// currentLtv: "0x0"
// healthFactor: "-0x1"
// healthFactorBelowThreshold: "0x0"
// totalBorrowBalanceUSD: "0x0"
// totalCollateralBalanceUSD: "0x0"
// totalFeesUSD: "0x0"
// totalLiquidityBalanceUSD: "0x0"

