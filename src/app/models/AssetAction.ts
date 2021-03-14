import {Asset} from "./Asset";

export class AssetAction {
  asset: Asset;
  before: number;
  after: number;
  amount: number;
  risk?: number;

  constructor(asset: Asset, before: number, after: number, amount: number, risk?: number) {
    this.asset = asset;
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.risk = risk;
  }
}
