export class InterestHistoryRecord {
  time: Date;
  supplyApy: number;
  borrowApr: number;

  constructor(time: Date, supplyApy: number, borrowApr: number) {
    this.time = time;
    this.supplyApy = supplyApy;
    this.borrowApr = borrowApr;
  }
}
