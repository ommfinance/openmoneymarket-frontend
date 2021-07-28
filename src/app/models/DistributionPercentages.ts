export class DistributionPercentages {
  daoFund: number;
  liquidityProvider: number;
  lendingBorrow: number;
  worker: number;

  constructor(daoFund: number, lp: number, lendingBorrow: number, worker: number) {
    this.daoFund = daoFund;
    this.liquidityProvider = lp;
    this.lendingBorrow = lendingBorrow;
    this.worker = worker;
  }
}
