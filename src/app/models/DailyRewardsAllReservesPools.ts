import {AssetTag} from "./Asset";
import BigNumber from "bignumber.js";

export class DailyRewardsAllReservesPools {
  liquidity?: LiquidityDailyRewards;
  staking?: StakingDailyRewards;
  reserve: ReserveDailyRewards;
  total: BigNumber;
  day: BigNumber;

  constructor(reserve: ReserveDailyRewards, total: BigNumber, day: BigNumber, liquidity?: LiquidityDailyRewards,
              staking?: StakingDailyRewards) {
    this.liquidity = liquidity;
    this.staking = staking;
    this.reserve = reserve;
    this.total = total;
    this.day = day;
  }

  public getClone(): DailyRewardsAllReservesPools {
    return new DailyRewardsAllReservesPools(this.reserve, this.total, this.day, this.liquidity, this.staking);
  }
}

export class LiquidityDailyRewards {
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

export class StakingDailyRewards {
  OMM: BigNumber;
  total: BigNumber;

  constructor(OMM: BigNumber, total: BigNumber) {
    this.OMM = OMM;
    this.total = total;
  }
}

export class ReserveDailyRewards {
  oUSDS: BigNumber;
  dUSDS: BigNumber;
  dICX: BigNumber;
  oICX: BigNumber;
  oIUSDC: BigNumber;
  dIUSDC: BigNumber;
  obnUSD: BigNumber;
  dbnUSD: BigNumber;
  oBALN: BigNumber;
  dBALN: BigNumber;
  oOMM: BigNumber;
  dOMM: BigNumber;
  total: BigNumber;

  constructor(oUSDS: BigNumber, dUSDS: BigNumber, dICX: BigNumber, oICX: BigNumber, oIUSDC: BigNumber, dIUSDC: BigNumber,
              obnUSD: BigNumber, dbnUSD: BigNumber, oBALN: BigNumber, dBALN: BigNumber, oOMM: BigNumber,
              dOMM: BigNumber, total: BigNumber) {
    this.oUSDS = oUSDS;
    this.dUSDS = dUSDS;
    this.dICX = dICX;
    this.oICX = oICX;
    this.oIUSDC = oIUSDC;
    this.dIUSDC = dIUSDC;
    this.obnUSD = obnUSD;
    this.dbnUSD = dbnUSD;
    this.oBALN = oBALN;
    this.dBALN = dBALN;
    this.oOMM = oOMM;
    this.dOMM = dOMM;
    this.total = total;
  }

  getDailySupplyRewardsForReserve(assetTag: AssetTag): BigNumber {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.oICX;
      case AssetTag.USDS:
        return this.oUSDS;
      case AssetTag.USDC:
        return this.oIUSDC;
      case AssetTag.bnUSD:
        return this.obnUSD;
      case AssetTag.BALN:
        return this.oBALN;
      case AssetTag.OMM:
        return this.oOMM;
      default:
        return new BigNumber("0");
    }
  }

  getDailyBorrowRewardsForReserve(assetTag: AssetTag): BigNumber {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.dICX;
      case AssetTag.USDS:
        return this.dUSDS;
      case AssetTag.USDC:
        return this.dIUSDC;
      case AssetTag.bnUSD:
        return this.dbnUSD;
      case AssetTag.BALN:
        return this.dBALN;
      case AssetTag.OMM:
        return this.dOMM;
      default:
        return new BigNumber("0");
    }
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



