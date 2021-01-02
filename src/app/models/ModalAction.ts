import {Modals} from "./Modals";
import {AssetAction} from "./AssetAction";

export class ModalAction {
  modalType: Modals;
  assetAction?: AssetAction;


  constructor(modalType: Modals, assetAction?: AssetAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
  }
}
