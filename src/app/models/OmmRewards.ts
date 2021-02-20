export class OmmRewards {
  deposit: number;
  borrow: number;
  ommICX: number;
  ommUSDb: number;
  worker: number;
  daoFund: number;
  total: number;


  constructor(deposit: number, borrow: number, ommICX: number, ommUSDb: number, worker: number, daoFund: number, total: number) {
    this.deposit = deposit;
    this.borrow = borrow;
    this.ommICX = ommICX;
    this.ommUSDb = ommUSDb;
    this.worker = worker;
    this.daoFund = daoFund;
    this.total = total;
  }
}


// Example response
// {
// borrow: "0xa0221668112278c02099"
// daoFund: "0x0"
// deposit: "0xc22804855a94cb6b5eb0"
// ommICX: "0x0"
// ommUSDb: "0x0"
// total: "0x1624a1aed6bb7442b7f49"
// worker: "0x0"
// }
