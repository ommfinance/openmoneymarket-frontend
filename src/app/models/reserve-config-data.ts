export class ReserveConfigData {
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  usageAsCollateralEnabled: boolean;
  borrowingEnabled: boolean;
  isActive: boolean;


  constructor(ltv: number, liquidationThreshold: number, liquidationBonus: number, usageAsCollateralEnabled: boolean, borrowingEnabled: boolean, isActive: boolean) {
    this.ltv = ltv;
    this.liquidationThreshold = liquidationThreshold;
    this.liquidationBonus = liquidationBonus;
    this.usageAsCollateralEnabled = usageAsCollateralEnabled;
    this.borrowingEnabled = borrowingEnabled;
    this.isActive = isActive;
  }
}

// Example
// "ltv": 0.6,
// "liquidationThreshold": 0.65,
// "liquidationBonus": 0.1,
// "usageAsCollateralEnabled": True,
// "borrowingEnabled": True,
// "isActive": True
