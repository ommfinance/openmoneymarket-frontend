import {InterestHistoryRecord} from "./InterestHistoryRecord";

export class InterestHistoryData {
  ICX?: InterestHistoryRecord[];
  USDS?: InterestHistoryRecord[];
  USDC?: InterestHistoryRecord[];
  bnUSD?: InterestHistoryRecord[];
  OMM: InterestHistoryRecord[];

  constructor(
    ICX: InterestHistoryRecord[],
    USDS: InterestHistoryRecord[],
    USDC: InterestHistoryRecord[],
    bnUSD: InterestHistoryRecord[],
    OMM: InterestHistoryRecord[],
  ) {
    this.ICX = ICX;
    this.USDS = USDS;
    this.USDC = USDC;
    this.bnUSD = bnUSD;
    this.OMM = OMM;
  }
}
