import {InterestHistoryRecord} from "./InterestHistoryRecord";

export class InterestHistoryData {
  ICX?: InterestHistoryRecord[];
  USDS?: InterestHistoryRecord[];
  USDC?: InterestHistoryRecord[];
  bnUSD?: InterestHistoryRecord[];
  // BALN: InterestHistoryRecordDto[];
  // OMM: InterestHistoryRecordDto[];

  constructor(
    ICX: InterestHistoryRecord[],
    USDS: InterestHistoryRecord[],
    USDC: InterestHistoryRecord[],
    bnUSD: InterestHistoryRecord[],
    // BALN: InterestHistoryRecordDto[],
    // OMM: InterestHistoryRecordDto[],
  ) {
    this.ICX = ICX;
    this.USDS = USDS;
    this.USDC = USDC;
    this.bnUSD = bnUSD;
    // this.BALN = BALN;
    // this.OMM = OMM;
  }
}
