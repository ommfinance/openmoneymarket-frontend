import {ModalType} from "./ModalType";
import {AssetAction} from "./AssetAction";
import {VoteAction} from "./VoteAction";

export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;
  voteAction?: VoteAction;

  constructor(modalType: ModalType, assetAction?: AssetAction, voteAction?: VoteAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
    this.voteAction = voteAction;
  }
}
