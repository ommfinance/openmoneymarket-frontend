export class OmmRewards {
  deposit: number;
  borrow: number;
  ommICX: number;
  ommUSDb: number;
  worker: number;
  daoFund: number;
  ommRewards: number;
  liquidityRewards: number;
  total: number;


  constructor(deposit: number, borrow: number, ommICX: number, ommUSDb: number, worker: number, daoFund: number,
              ommRewards: number, liquidityRewards: number, total: number) {
    this.deposit = deposit;
    this.borrow = borrow;
    this.ommICX = ommICX;
    this.ommUSDb = ommUSDb;
    this.worker = worker;
    this.daoFund = daoFund;
    this.ommRewards = ommRewards;
    this.liquidityRewards = liquidityRewards;
    this.total = total;
  }

  public getClone(): OmmRewards {
    return new OmmRewards(this.deposit, this.borrow, this.ommICX, this.ommUSDb, this.worker, this.daoFund, this.ommRewards,
      this.liquidityRewards, this.total);
  }
}

// Example response
// "deposit": "0x7e42a77b91f0a9d23f",
//   "borrow": "0x1cf08378ebf4209810b",
//   "worker": "0x0",
//   "ommICX": "0x0",
//   "ommUSDb": "0x0",
//   "daoFund": "0x0",
//   "ommRewards": "0x24d4adf0a5132b3534a",
//   "liquidityRewards": "0x0",
//   "total": "0x24d4adf0a5132b3534a"
