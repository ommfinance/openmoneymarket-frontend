export class TokenBalances {
  ICX: number = 0;
  USDb: number = 0;


  constructor(ICX?: number, USDb?: number) {
    this.ICX = ICX ?? 0;
    this.USDb = USDb ?? 0;
  }
}
