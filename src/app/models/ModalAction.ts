import {ModalType} from "./ModalType";
import {AssetAction} from "./AssetAction";
import {StakingAction} from "./StakingAction";
import {VoteAction} from "./VoteAction";
import {GovernanceAction} from "./GovernanceAction";

export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;
  stakingAction?: StakingAction;
  governanceAction?: GovernanceAction;
  voteAction?: VoteAction;

  constructor(modalType: ModalType, assetAction?: AssetAction, stakingAction?: StakingAction, voteAction?: VoteAction,
              governanceAction?: GovernanceAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
    this.stakingAction = stakingAction;
    this.voteAction = voteAction;
    this.governanceAction = governanceAction;
  }
}

export class ModalActionsResult {
  modalAction: ModalAction;
  status: ModalStatus;

  constructor(modalAction: ModalAction, status: ModalStatus) {
    this.modalAction = modalAction;
    this.status = status;
  }
}

export enum ModalStatus {
  SUCCESS,
  FAILED,
  CANCELLED
}
