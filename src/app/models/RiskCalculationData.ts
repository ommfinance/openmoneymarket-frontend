import {UserAction} from "./UserAction";
import {AssetTag} from "./Asset";

export class RiskCalculationData {
  assetTag: AssetTag;
  amount: number;
  action: UserAction;

  constructor(assetTag: AssetTag, amount: number, action: UserAction) {
    this.assetTag = assetTag;
    this.amount = amount;
    this.action = action;
  }
}
