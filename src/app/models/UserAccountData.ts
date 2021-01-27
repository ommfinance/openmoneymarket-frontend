export class UserAccountData {
  availableBorrowsUSD: number;
  borrowingPower: number;
  currentLiquidationThreshold: number;
  currentLtv: number;
  healthFactor: number;
  healthFactorBelowThreshold: number;
  totalBorrowBalanceUSD: number;
  totalCollateralBalanceUSD: number;
  totalFeesUSD: number;
  totalLiquidityBalanceUSD: number;


  constructor(availableBorrowsUSD: number, borrowingPower: number, currentLiquidationThreshold: number, currentLtv: number,
              healthFactor: number, healthFactorBelowThreshold: number, totalBorrowBalanceUSD: number, totalCollateralBalanceUSD: number,
              totalFeesUSD: number, totalLiquidityBalanceUSD: number) {
    this.availableBorrowsUSD = availableBorrowsUSD;
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
// availableBorrowsUSD: "0x22b273729c679b10"
// borrowingPower: "0x0"
// currentLiquidationThreshold: "0x905438e60010000"
// currentLtv: "0x6f05b59d3b20000"
// healthFactor: "-0x1"
// healthFactorBelowThreshold: "0x0"
// totalBorrowBalanceUSD: "0x0"
// totalCollateralBalanceUSD: "0x4564e6e538cf361f"
// totalFeesUSD: "0x0"
// totalLiquidityBalanceUSD: "0x4564e6e538cf361f"

