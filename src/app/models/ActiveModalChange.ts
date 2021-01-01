import {Modals} from "./Modals";
import {Asset} from "./Asset";

export class ActiveModalChange {
  modalType: Modals;
  asset?: Asset;


  constructor(modalType: Modals, asset?: Asset) {
    this.modalType = modalType;
    this.asset = asset;
  }
}
