export interface AllReserves {
  USDb: USDbReserve
}

export interface USDbReserve {
  availableLiquidity: number;
  baseLTVasCollateral: number;
  borrowCumulativeIndex: number;
  borrowRate: number;
  borrowingEnabled: number;
  decimals: number;
  isActive: number;
  isFreezed: number;
  lastUpdateTimestamp: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  liquidityCumulativeIndex: number;
  liquidityRate: number;
  oTokenAddress: number;
  reserveAddress: number;
  totalBorrows: number;
  totalLiquidity: number;
  usageAsCollateralEnabled: number;
}

// Example
// availableLiquidity: "0x3860e639d80640000"
// baseLTVasCollateral: "0x340aad21b3b700000"
// borrowCumulativeIndex: "0xde0b6b3a7640000"
// borrowRate: "0x0"
// borrowingEnabled: "0x1"
// decimals: "0x12"
// isActive: "0x1"
// isFreezed: "0x0"
// lastUpdateTimestamp: "0x0"
// liquidationBonus: "0xa"
// liquidationThreshold: "0x41"
// liquidityCumulativeIndex: "0xde0b6b3a7640000"
// liquidityRate: "0x0"
// oTokenAddress: "cx4258464e395b3ef3b73a146947eb41393e8c5873"
// reserveAddress: "cx19be1be7b4e7750863edf966faac3f42dec21025"
// totalBorrows: "0x0"
// totalLiquidity: "0x3860e639d80640000"
// usageAsCollateralEnabled: "0x1"
