export class DailyRewardsAllReservesPools {
  liquidity: LiquidityDailyRewards;
  staking: StakingDailyRewards;
  reserve: ReserveDailyRewards;
  total: number;
  day: number;

  constructor(liquidity: LiquidityDailyRewards, staking: StakingDailyRewards, reserve: ReserveDailyRewards, total: number, day: number) {
    this.liquidity = liquidity;
    this.staking = staking;
    this.reserve = reserve;
    this.total = total;
    this.day = day;
  }

  public getClone(): DailyRewardsAllReservesPools {
    return new DailyRewardsAllReservesPools(this.liquidity, this.staking, this.reserve, this.total, this.day);
  }
}

export class LiquidityDailyRewards {
  "OMM/SICX": number;
  "OMM/USDS": number;
  "OMM/IUSDC": number;
  total: number;

  constructor(ommSicx: number, ommUsds: number, ommIusdc: number, total: number) {
    this["OMM/SICX"] = ommSicx;
    this["OMM/USDS"] = ommUsds;
    this["OMM/IUSDC"] = ommIusdc;
    this.total = total;
  }
}

export class StakingDailyRewards {
  OMM: number;
  total: number;

  constructor(OMM: number, total: number) {
    this.OMM = OMM;
    this.total = total;
  }
}

export class ReserveDailyRewards {
  oUSDS: number;
  dUSDS: number;
  dICX: number;
  oICX: number;
  oIUSDC: number;
  dIUSDC: number;
  total: number;

  constructor(oUSDS: number, dUSDS: number, dICX: number, oICX: number, oIUSDC: number, dIUSDC: number, total: number) {
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
//   "OMM/SICX": "0x43c33c1937564800000",
//     "OMM/USDS": "0x43c33c1937564800000",
//     "OMM/IUSDC": "0x43c33c1937564800000",
//     "total": "0xcb49b44ba602d800000",
// },
//   "staking": {
//   "OMM": "0x43c33c1937564800000",
//     "total": "0x43c33c1937564800000"
// },
//   "reserve": {
//   "oUSDS": "0x1b1ae4d6e2ef5000000",
//     "dUSDS": "0x1b1ae4d6e2ef5000000",
//     "dICX": "0x2b5e3af16b18800000",
//     "oICX": "0x18650127cc3dc800000",
//     "oIUSDC": "0x1b1ae4d6e2ef5000000",
//     "dIUSDC": "0x1b1ae4d6e2ef5000000",
//     "total": "0x878678326eac9000000"
// },
//   "day": "0x22",
//   "total": "0x1969368974c05b000000"
// }



