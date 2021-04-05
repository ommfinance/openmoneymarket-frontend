export class UnstakeInfo {
  totalAmount: number;
  details: UnstakeIcxData[];

  constructor(totalAmount: number, details: UnstakeIcxData[]) {
    this.totalAmount = totalAmount;
    this.details = details;
  }
}

export class UnstakeIcxData {
  amount: number;
  unstakingBlockHeight: number;

  constructor(amount: number, unstakingBlockHeight: number) {
    this.amount = amount;
    this.unstakingBlockHeight = unstakingBlockHeight;
  }
}
