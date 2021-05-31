import {AssetTag} from "./Asset";

export class UserReserveData {
  borrowRate: number;
  currentBorrowBalance: number;
  currentBorrowBalanceUSD: number;
  currentOTokenBalance: number;
  currentOTokenBalanceUSD: number;
  exchangeRate: number;
  lastUpdateTimestamp: number;
  liquidityRate: number;
  originationFee: number;
  principalBorrowBalance: number;
  principalBorrowBalanceUSD: number;
  principalOTokenBalance: number;
  principalOTokenBalanceUSD: number;
  useAsCollateral: number;
  userBorrowCumulativeIndex: number;
  userLiquidityIndex: number;

  constructor(borrowRate: number, currentBorrowBalance: number, currentBorrowBalanceUSD: number, currentOTokenBalance: number,
              currentOTokenBalanceUSD: number, exchangeRate: number, lastUpdateTimestamp: number, liquidityRate: number,
              originationFee: number, principalBorrowBalance: number, principalBorrowBalanceUSD: number, principalOTokenBalance: number,
              principalOTokenBalanceUSD: number, useAsCollateral: number, userBorrowCumulativeIndex: number, userLiquidityIndex: number) {
    this.borrowRate = borrowRate;
    this.currentBorrowBalance = currentBorrowBalance;
    this.currentBorrowBalanceUSD = currentBorrowBalanceUSD;
    this.currentOTokenBalance = currentOTokenBalance;
    this.currentOTokenBalanceUSD = currentOTokenBalanceUSD;
    this.exchangeRate = exchangeRate;
    this.lastUpdateTimestamp = lastUpdateTimestamp;
    this.liquidityRate = liquidityRate;
    this.originationFee = originationFee;
    this.principalBorrowBalance = principalBorrowBalance;
    this.principalBorrowBalanceUSD = principalBorrowBalanceUSD;
    this.principalOTokenBalance = principalOTokenBalance;
    this.principalOTokenBalanceUSD = principalOTokenBalanceUSD;
    this.useAsCollateral = useAsCollateral;
    this.userBorrowCumulativeIndex = userBorrowCumulativeIndex;
    this.userLiquidityIndex = userLiquidityIndex;
  }
}

export class UserReserves {
  public reserveMap: Map<AssetTag, UserReserveData | undefined> = new Map([
    [AssetTag.USDS, undefined],
    [AssetTag.ICX, undefined],
    [AssetTag.USDC, undefined],
  ]);
}

// EXAMPLE
// borrowRate: "0x0"
// currentBorrowBalance: "0x0"
// currentBorrowBalanceUSD: "0x0"
// currentOTokenBalance: "0x8ac9cdca719e6c3d"
// currentOTokenBalanceUSD: "0x45e9ee9edbbd4e5a"
// exchangeRate: "0x6fda8aaf22cd54d"
// lastUpdateTimestamp: "0x0"
// liquidityRate: "0x0"
// originationFee: "0x0"
// principalBorrowBalance: "0x0"
// principalBorrowBalanceUSD: "0x0"
// principalOTokenBalance: "0x8ac9cdca719e6c3d"
// principalOTokenBalanceUSD: "0x45e9ee9edbbd4e5a"
// useAsCollateral: "0x1"
// userBorrowCumulativeIndex: "0x0"
// userLiquidityIndex: null
