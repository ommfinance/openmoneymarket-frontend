import {ModalType} from "./ModalType";
import {AssetAction} from "./AssetAction";
import {StakingAction} from "./StakingAction";
import {VoteAction} from "./VoteAction";

export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;
  stakingAction?: StakingAction;
  voteAction?: VoteAction;

  constructor(modalType: ModalType, assetAction?: AssetAction, stakingAction?: StakingAction, voteAction?: VoteAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
    this.stakingAction = stakingAction;
    this.voteAction = voteAction;
  }
}

export class ModalActionsResult {
  modalAction: ModalAction;
  success: boolean;

  constructor(modalAction: ModalAction, success: boolean) {
    this.modalAction = modalAction;
    this.success = success;
  }
}
