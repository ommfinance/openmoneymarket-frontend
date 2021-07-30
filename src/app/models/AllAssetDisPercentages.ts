export class AllAssetDistPercentages {
  liquidity: LiquidityAllAsset;
  staking: StakingAllAsset;
  reserve: ReserveAllAsset;


  constructor(liquidity: LiquidityAllAsset, staking: StakingAllAsset, reserve: ReserveAllAsset) {
    this.liquidity = liquidity;
    this.staking = staking;
    this.reserve = reserve;
  }

  public getClone(): AllAssetDistPercentages {
    return new AllAssetDistPercentages(this.liquidity, this.staking, this.reserve);
  }
}

export class LiquidityAllAsset {
  "OMM/SICX": number;
  "OMM/USDS": number;
  "OMM/IUSDC": number;

  constructor(ommSicx: number, ommUsds: number, ommIusdc: number) {
    this["OMM/SICX"] = ommSicx;
    this["OMM/USDS"] = ommUsds;
    this["OMM/IUSDC"] = ommIusdc;
  }
}

export class StakingAllAsset {
  OMM: number;

  constructor(OMM: number) {
    this.OMM = OMM;
  }
}

export class ReserveAllAsset {
  oUSDS: number;
  dUSDS: number;
  dICX: number;
  oICX: number;
  oIUSDC: number;
  dIUSDC: number;


  constructor(oUSDS: number, dUSDS: number, dICX: number, oICX: number, oIUSDC: number, dIUSDC: number) {
    this.oUSDS = oUSDS;
    this.dUSDS = dUSDS;
    this.dICX = dICX;
    this.oICX = oICX;
    this.oIUSDC = oIUSDC;
    this.dIUSDC = dIUSDC;
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


