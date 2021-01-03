export class ReserveConfigData {
  baseLTVasCollateral: number;
  borrowingEnabled: number;
  decimals: number;
  isActive: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  usageAsCollateralEnabled: number;


  constructor(baseLTVasCollateral: number, decimals: number, liquidationThreshold: number, liquidationBonus: number,
              usageAsCollateralEnabled: number, borrowingEnabled: number, isActive: number) {
    this.baseLTVasCollateral = baseLTVasCollateral;
    this.decimals = decimals;
    this.liquidationThreshold = liquidationThreshold;
    this.liquidationBonus = liquidationBonus;
    this.usageAsCollateralEnabled = usageAsCollateralEnabled;
    this.borrowingEnabled = borrowingEnabled;
    this.isActive = isActive;
  }
}

// Example
// baseLTVasCollateral: "0x6f05b59d3b20000"
// borrowingEnabled: "0x1"
// decimals: "0x12"
// isActive: "0x1"
// liquidationBonus: "0x16345785d8a0000"
// liquidationThreshold: "0x905438e60010000"
// usageAsCollateralEnabled: "0x1"
