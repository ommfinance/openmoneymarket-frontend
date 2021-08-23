import BigNumber from "bignumber.js";

export class AllAssetDistPercentages {
  liquidity?: LiquidityAllAsset;
  staking?: StakingAllAsset;
  reserve: ReserveAllAsset;
  total: BigNumber;

  constructor(reserve: ReserveAllAsset, total: BigNumber, liquidity?: LiquidityAllAsset, staking?: StakingAllAsset) {
    this.liquidity = liquidity;
    this.staking = staking;
    this.reserve = reserve;
    this.total = total;
  }

  public getClone(): AllAssetDistPercentages {
    return new AllAssetDistPercentages(this.reserve, this.total, this.liquidity, this.staking);
  }
}

export class LiquidityAllAsset {
  "OMM/SICX": BigNumber;
  "OMM/USDS": BigNumber;
  "OMM/IUSDC": BigNumber;
  total: BigNumber;

  constructor(ommSicx: BigNumber, ommUsds: BigNumber, ommIusdc: BigNumber, total: BigNumber) {
    this["OMM/SICX"] = ommSicx;
    this["OMM/USDS"] = ommUsds;
    this["OMM/IUSDC"] = ommIusdc;
    this.total = total;
  }
}

export class StakingAllAsset {
  OMM: BigNumber;
  total: BigNumber;

  constructor(OMM: BigNumber, total: BigNumber) {
    this.OMM = OMM;
    this.total = total;
  }
}

export class ReserveAllAsset {
  oUSDS: BigNumber;
  dUSDS: BigNumber;
  dICX: BigNumber;
  oICX: BigNumber;
  oIUSDC: BigNumber;
  dIUSDC: BigNumber;
  total: BigNumber;

  constructor(oUSDS: BigNumber, dUSDS: BigNumber, dICX: BigNumber, oICX: BigNumber, oIUSDC: BigNumber, dIUSDC: BigNumber,
              total: BigNumber) {
    this.oUSDS = oUSDS;
    this.dUSDS = dUSDS;
    this.dICX = dICX;
    this.oICX = oICX;
    this.oIUSDC = oIUSDC;
    this.dIUSDC = dIUSDC;
    this.total = total;
  }
}

// Example response
// {
//   "liquidity": {
//   "OMM/SICX": "0xb1a2bc2ec50000",
//     "OMM/USDS": "0xb1a2bc2ec50000",
//     "OMM/IUSDC": "0xb1a2bc2ec50000"
// },
//   "staking": {
//   "OMM": "0xb1a2bc2ec50000"
// },
//   "reserve": {
//   "oUSDS": "0x470de4df820000",
//     "dUSDS": "0x470de4df820000",
//     "dICX": "0x71afd498d0000",
//     "oICX": "0x3ff2e795f50000",
//     "oIUSDC": "0x470de4df820000",
//     "dIUSDC": "0x470de4df820000"
// }
// }


