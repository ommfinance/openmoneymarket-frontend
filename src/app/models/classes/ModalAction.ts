import {ModalType} from "../enums/ModalType";
import {AssetAction} from "./AssetAction";
import {StakingAction} from "./StakingAction";
import {VoteAction} from "./VoteAction";
import {GovernanceAction} from "./GovernanceAction";
import {LockingAction} from "./LockingAction";

export class ModalAction {
  modalType: ModalType;
  assetAction?: AssetAction;
  stakingAction?: StakingAction;
  governanceAction?: GovernanceAction;
  voteAction?: VoteAction;
  lockingOmmAction?: LockingAction;

  constructor(modalType: ModalType, assetAction?: AssetAction, stakingAction?: StakingAction, voteAction?: VoteAction,
              governanceAction?: GovernanceAction, lockingOmmAction?: LockingAction) {
    this.modalType = modalType;
    this.assetAction = assetAction;
    this.stakingAction = stakingAction;
    this.voteAction = voteAction;
    this.governanceAction = governanceAction;
    this.lockingOmmAction = lockingOmmAction;
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
