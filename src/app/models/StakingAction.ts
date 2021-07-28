export class StakingAction{
  before: number;
  after: number;
  amount: number;
  payload: any;

  constructor(before: number, after: number, amount: number, payload?: any) {
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.payload = payload;
  }
}
