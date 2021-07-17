export class DistributionPercentages {
  daoFund: number;
  lp: number;
  supplyBorrow: number;
  workerToken: number;

  constructor(daoFund: number, lp: number, supplyBorrow: number, workerToken: number) {
    this.daoFund = daoFund;
    this.lp = lp;
    this.supplyBorrow = supplyBorrow;
    this.workerToken = workerToken;
  }
}
