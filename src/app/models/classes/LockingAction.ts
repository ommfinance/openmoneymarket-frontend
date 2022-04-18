import BigNumber from "bignumber.js";

export class LockingAction {
  before: number;
  after: number;
  amount: number;
  lockingTime: BigNumber; // in milliseconds
  payload: any;

  constructor(before: number, after: number, amount: number, lockingTime: BigNumber, payload?: any) {
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.lockingTime = lockingTime;
    this.payload = payload;
  }
}
