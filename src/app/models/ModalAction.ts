import {ModalType} from "./ModalType";
import {AssetAction} from "./AssetAction";

export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;


  constructor(modalType: ModalType, assetAction?: AssetAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
  }
}
