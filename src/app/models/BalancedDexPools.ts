export enum BalancedDexPools {
  OMM2_IUSDC = "OMM2/IUSDC",
  OMM2_USDS = "OMM2/USDS",
}

export const balDexPoolsPriceDecimalsMap: Map<BalancedDexPools, number> = new Map<BalancedDexPools, number>([
  [BalancedDexPools.OMM2_IUSDC, 6],
  [BalancedDexPools.OMM2_USDS, 18],
  ]
);
