export class UserAccountData {
  totalLiquidityICX: number;
  totalCollateralICX: number;
  totalBorrowsICX: number;
  totalFeesICX: number;
  availableBorrowsICX: number;
  collateralInterestICX: number;
  totalLiquidityUSD: number;
  totalCollateralUSD: number;
  totalBorrowsUSD: number;
  totalFeesUSD: number;
  availableBorrowsUSD: number;
  collateralInterestUSD: number;
  liquidityRate: number;
  borrowRate: number;
  currentLiquidationThreshold: number;
  ltv: number;
  healthFactor: number;


  constructor(totalLiquidityICX: number, totalCollateralICX: number, totalBorrowsICX: number, totalFeesICX: number,
              availableBorrowsICX: number, collateralInterestICX: number, totalLiquidityUSD: number,
              totalCollateralUSD: number, totalBorrowsUSD: number, totalFeesUSD: number, availableBorrowsUSD: number,
              collateralInterestUSD: number, liquidityRate: number, borrowRate: number,
              currentLiquidationThreshold: number, ltv: number, healthFactor: number) {
    this.totalLiquidityICX = totalLiquidityICX;
    this.totalCollateralICX = totalCollateralICX;
    this.totalBorrowsICX = totalBorrowsICX;
    this.totalFeesICX = totalFeesICX;
    this.availableBorrowsICX = availableBorrowsICX;
    this.collateralInterestICX = collateralInterestICX;
    this.totalLiquidityUSD = totalLiquidityUSD;
    this.totalCollateralUSD = totalCollateralUSD;
    this.totalBorrowsUSD = totalBorrowsUSD;
    this.totalFeesUSD = totalFeesUSD;
    this.availableBorrowsUSD = availableBorrowsUSD;
    this.collateralInterestUSD = collateralInterestUSD;
    this.liquidityRate = liquidityRate;
    this.borrowRate = borrowRate;
    this.currentLiquidationThreshold = currentLiquidationThreshold;
    this.ltv = ltv;
    this.healthFactor = healthFactor;
  }
}

// example
// "totalLiquidityICX": 100,
//   "totalCollateralICX": 1000,
//   "totalBorrowsICX": 100,
//   "totalFeesICX": 5.6,
//   "availableBorrowsICX": 100,
//   "collateralInterestICX": 10,
//   "totalLiquidityUSD": 100,
//   "totalCollateralUSD": 1000,
//   "totalBorrowsUSD": 100,
//   "totalFeesUSD": 5.6,
//   "availableBorrowsUSD": 100,
//   "collateralInterestUSD": 10,
//   “liquidityRate”: 12.6,
//   “borrowRate”: 14.7,
//   "currentLiquidationThreshold": 0.65,
//   "ltv": 0.75,
//   "healthFactor": 1.2
