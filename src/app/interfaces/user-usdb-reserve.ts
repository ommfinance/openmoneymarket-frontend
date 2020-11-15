export interface UserUSDbReserve {
  borrowRate: number;
  currentBorrowBalance: number;
  currentBorrowBalanceUSD: number;
  currentOTokenBalance: number;
  currentOTokenBalanceUSD: number;
  lastUpdateTimestamp: number;
  liquidityRate: number;
  originationFee: number;
  principalBorrowBalance: number;
  principalBorrowBalanceUSD: number;
  useAsCollateral: number;
  userBorrowCumulativeIndex: number;
}

// EXAMPLE
// borrowRate: "0x129c8ee09dacf"
// currentBorrowBalance: "0x0"
// currentBorrowBalanceUSD: "0x0"
// currentOTokenBalance: "0x6f05b59f70ca5f49"
// currentOTokenBalanceUSD: "0x6f05b59f70ca5f49"
// lastUpdateTimestamp: "0x0"
// liquidityRate: "0xc08c7dc830"
// originationFee: "0x0"
// principalBorrowBalance: "0x0"
// principalBorrowBalanceUSD: "0x0"
// useAsCollateral: "0x1"
// userBorrowCumulativeIndex: "0x0"
