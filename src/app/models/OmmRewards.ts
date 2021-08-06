import {AssetTag} from "./Asset";

export class OmmRewards {
  liquidity: Liquidity;
  staking: Staking;
  reserve: Reserve;
  total: number;


  constructor(liquidity: Liquidity, staking: Staking, reserve: Reserve, total: number) {
    this.liquidity = liquidity;
    this.staking = staking;
    this.reserve = reserve;
    this.total = total;
  }

  public getClone(): OmmRewards {
    return new OmmRewards(this.liquidity, this.staking, this.reserve, this.total);
  }
}

export class Liquidity {
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

export class Staking {
  OMM: number;
  total: number;

  constructor(OMM: number, total: number) {
    this.OMM = OMM;
    this.total = total;
  }
}

export class Reserve {
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
//   "OMM/SICX": "0x1aa4b1bab30d23348b1",
//     "OMM/USDS": "0x1b7385ebca36e08954e",
//     "OMM/IUSDC": "0x406f49cb54104f282b7",
//     "total": "0x406f49cb54104f282b7"
// },
//   "staking": {
//   "OMM": "0x57214ee5a8ee19c783c",
//     "total": "0x57214ee5a8ee19c783c"
// },
//   "reserve": {
//   "oUSDS": "0x16a1b5b6780ba093984",
//     "total": "0x13371d016451390196c71e12e60",
//     "dUSDS": "0x0",
//     "dICX": "0x0",
//     "oICX": "0x6f06ad64f56d6f0ae",
//     "oIUSDC": "0x0",
//     "dIUSDC": "0x13371d016451390196c71e12e60"
// },
//   "total": "0x13371d02490ac5bcee0a98c3184"
// }

