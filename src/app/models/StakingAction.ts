export class StakingAction{
  before: number;
  after: number;
  amount: number;

  constructor(before: number, after: number, amount: number) {
    this.before = before;
    this.after = after;
    this.amount = amount;
  }
}
