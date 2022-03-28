import {Asset} from "./Asset";
import {UserOmmRewards} from "./UserOmmRewards";
import BigNumber from "bignumber.js";

export class AssetAction {
  asset: Asset;
  before: BigNumber;
  after: BigNumber;
  amount: BigNumber;
  risk?: BigNumber;
  details?: ClaimOmmDetails;

  constructor(asset: Asset, before: BigNumber, after: BigNumber, amount: BigNumber, risk?: BigNumber, details?: ClaimOmmDetails) {
    this.asset = asset;
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.risk = risk;
    this.details = details;
  }
}

export class ClaimOmmDetails {
  ommRewards?: UserOmmRewards;

  constructor(ommRewards?: UserOmmRewards) {
    this.ommRewards = ommRewards;
  }
}
