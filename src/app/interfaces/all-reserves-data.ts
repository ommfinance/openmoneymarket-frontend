import {AssetTag} from "../models/Asset";
import {OmmError} from "../core/errors/OmmError";

export class AllReservesData {
  USDb: ReserveData;
  ICX: ReserveData;

  constructor(USDb: ReserveData, sICX: ReserveData) {
    this.USDb = USDb;
    this.ICX = sICX;
  }

  public getReserveData(assetTag: AssetTag): ReserveData {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.ICX;
      case AssetTag.USDb:
        return this.USDb;
      default:
        throw new OmmError(`AllReserves.getReserveData: Unsupported parameter = ${assetTag}`);
    }
  }

  public setReserveData(assetTag: AssetTag, reserveData: ReserveData): void {
    switch (assetTag) {
      case AssetTag.ICX:
        this.ICX = reserveData;
        break;
      case AssetTag.USDb:
        this.USDb = reserveData;
        break;
      default:
        throw new OmmError(`AllReserves.setReserveData: Unsupported parameter = ${assetTag}`);
    }
  }
}

export class ReserveData {
  totalLiquidity: number;
  availableLiquidity: number;
  totalLiquidityUSD: number;
  availableLiquidityUSD: number;
  totalBorrows: number;
  totalBorrowsUSD: number;
  liquidityRate: number;
  borrowRate: number;
  utilizationRate: number;
  oTokenAddress: string;
  exchangePrice: number;
  lastUpdateTimestamp: number;
  baseLTVasCollateral: number;
  borrowCumulativeIndex: number;
  borrowingEnabled: number;
  decimals: number;
  isActive: number;
  isFreezed: number;
  liquidationBonus: number;
  liquidationThreshold: number;
  liquidityCumulativeIndex: number;
  reserveAddress: string;
  usageAsCollateralEnabled: number;

  constructor(totalLiquidity: number, availableLiquidity: number, totalLiquidityUSD: number, availableLiquidityUSD: number,
              totalBorrows: number, totalBorrowsUSD: number, liquidityRate: number, borrowRate: number, utilizationRate: number,
              oTokenAddress: string, exchangePrice: number, lastUpdateTimestamp: number, baseLTVasCollateral: number,
              borrowCumulativeIndex: number, borrowingEnabled: number, decimals: number, isActive: number, isFreezed: number,
              liquidationBonus: number, liquidationThreshold: number, liquidityCumulativeIndex: number, reserveAddress: string,
              usageAsCollateralEnabled: number) {
    this.totalLiquidity = totalLiquidity;
    this.availableLiquidity = availableLiquidity;
    this.totalLiquidityUSD = totalLiquidityUSD;
    this.availableLiquidityUSD = availableLiquidityUSD;
    this.totalBorrows = totalBorrows;
    this.totalBorrowsUSD = totalBorrowsUSD;
    this.liquidityRate = liquidityRate;
    this.borrowRate = borrowRate;
    this.utilizationRate = utilizationRate;
    this.oTokenAddress = oTokenAddress;
    this.exchangePrice = exchangePrice;
    this.lastUpdateTimestamp = lastUpdateTimestamp;
    this.baseLTVasCollateral = baseLTVasCollateral;
    this.borrowCumulativeIndex = borrowCumulativeIndex;
    this.borrowingEnabled = borrowingEnabled;
    this.decimals = decimals;
    this.isActive = isActive;
    this.isFreezed = isFreezed;
    this.liquidationBonus = liquidationBonus;
    this.liquidationThreshold = liquidationThreshold;
    this.liquidityCumulativeIndex = liquidityCumulativeIndex;
    this.reserveAddress = reserveAddress;
    this.usageAsCollateralEnabled = usageAsCollateralEnabled;
  }
}

// Example
// availableLiquidity: "0x7f207937acc857f1b"
// baseLTVasCollateral: "0x6f05b59d3b20000"
// borrowCumulativeIndex: "0xde0b6b3a7640000"
// borrowRate: "0x0"
// borrowingEnabled: "0x1"
// decimals: "0x12"
// exchangePrice: "0x6f05b59d3b20000"
// isActive: "0x1"
// isFreezed: "0x0"
// lastUpdateTimestamp: "0x5b92bbdf2a379"
// liquidationBonus: "0x16345785d8a0000"
// liquidationThreshold: "0x905438e60010000"
// liquidityCumulativeIndex: "0xde0b6b3a7640000"
// liquidityRate: "0x0"
// oTokenAddress: "cx7dcf7232084a085507bf2685f785589ebb0b52a1"
// reserveAddress: "cxb7eda227d9ed9c6fc2a74aa5dd7e9a3913f6c281"
// totalBorrows: "0x0"
// totalLiquidity: "0x7f207937acc857f1b"
// usageAsCollateralEnabled: "0x1"

