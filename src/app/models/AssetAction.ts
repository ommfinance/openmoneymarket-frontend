import {Asset} from "./Asset";
import {OmmRewards} from "./OmmRewards";

export class AssetAction {
  asset: Asset;
  before: number;
  after: number;
  amount: number;
  risk?: number;
  details?: ClaimOmmDetails;

  constructor(asset: Asset, before: number, after: number, amount: number, risk?: number, details?: ClaimOmmDetails) {
    this.asset = asset;
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.risk = risk;
    this.details = details;
  }
}

export class ClaimOmmDetails {
  ommRewards?: OmmRewards;

  constructor(ommRewards?: OmmRewards) {
    this.ommRewards = ommRewards;
  }
}
