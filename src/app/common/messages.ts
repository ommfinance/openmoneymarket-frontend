import {AssetTag} from "../models/classes/Asset";
import {AssetAction} from "../models/classes/AssetAction";
import {StakingAction} from "../models/classes/StakingAction";
import {LockingAction} from "../models/classes/LockingAction";
import {Utils} from "./utils";
import {ManageStakedIcxAction} from "../models/classes/ManageStakedIcxAction";
import BigNumber from "bignumber.js";
import {ommForumDomain} from "./constants";


/**
 * LEGEND:
 * '/n' means new line, similar as <br> tag
 * ${variable} is used to interpolate variable inside string (e.g. ${assetTag} is replaced with e.g. OMM)
 */

export const LEDGER_NOT_DETECTED = "Couldn’t detect a Ledger device.\n Make sure it’s connected and try again.";

/*
 *  NOTIFICATIONS SHOWN WHEN TRANSACTION IS SUBMITTED TO THE BLOCKCHAIN
 */
export const PRE_UNSTAKE_OMM = "Starting the unstaking process...";
export const PRE_MIGRATE_STAKED_OMM = "Locking up staked OMM...";
export const PRE_INCREASE_LOCKED_OMM = "Locking up OMM...";
export const PRE_INCREASE_LOCKED_PERIOD = "Locking up OMM...";
export const PRE_INCREASE_LOCK_AMOUNT_AND_PERIOD = "Locking up OMM...";
export const PRE_LOCK_OMM = "Locking up OMM...";
export const PRE_WITHDRAW_LOCKED_OMM = "Withdrawing OMM...";
export const PRE_CLAIM_AND_APPLY_BOOST = "Claiming OMM...\nApplying boost...";
export const PRE_CLAIM_OMM = "Claiming rewards...";
export const PRE_APPLY_BOOST = "Applying boost...";
export const PRE_SUBMIT_PROPOSAL = "Submitting proposal...";
export const PRE_CLAIM_ICX = "Claiming ICX...";
export const PRE_UPDATE_VOTES = "Allocating votes...";
export const PRE_REMOVE_ALL_VOTES = "Removing all votes...";
export const PRE_CAST_VOTE = "Casting vote...";
export const PRE_STAKE_LP = "Staking LP tokens...";
export const PRE_UNSTAKE_LP = "Unstaking LP tokens...";

// functions that accept parameter and interpolates it (replaces) in string
export const PRE_BORROW_ASSET = (assetTag: AssetTag) => `Borrowing ${assetTag}...`;
export const PRE_SUPPLY_ASSET = (assetTag: AssetTag) => `Supplying ${assetTag}...`;
export const PRE_REPAY_ASSET = (assetTag: AssetTag) => `Repaying ${assetTag}...`;
export const PRE_WITHDRAW_ASSET = (assetTag: AssetTag) => `Withdrawing ${assetTag}...`;

/*
 *  NOTIFICATIONS SHOWN AFTER TRANSACTION SUCCESS
 */
export const SUCCESS_ASSET_SUPPLIED = (assetAction: AssetAction) => `${assetAction.amount} ${assetAction.asset.tag} supplied.`;
export const SUCCESS_ASSET_WITHDRAWN = (assetAction: AssetAction) => `${assetAction.amount} ${assetAction.asset.tag} withdrawn.`;
export const SUCCESS_ASSET_BORROWED = (assetAction: AssetAction) => `${assetAction.amount} ${assetAction.asset.tag} borrowed.`;
export const SUCCESS_ASSET_REPAID = (assetAction: AssetAction) => `${assetAction.amount} ${assetAction.asset.tag} repaid.`;
export const SUCCESS_CLAIM_ICX = (assetAction: AssetAction) => `${assetAction.amount} ICX claimed.`;
export const SUCCESS_CLAIM_OMM = (assetAction: AssetAction) => `${assetAction.amount} OMM claimed.`;
export const SUCCESS_WITHDRAW_LOCKED_OMM = (assetAction: AssetAction) => `Withdrew ${assetAction.amount} OMM.`;
export const SUCCESS_UNSTAKE_OMM = (stakingAction: StakingAction | ManageStakedIcxAction) => `${stakingAction.amount} OMM unstaking.`;
export const SUCCESS_STAKE_LP = (stakingAction: StakingAction) => `${stakingAction.amount} LP tokens staked.`;
export const SUCCESS_UNSTAKE_LP = (stakingAction: StakingAction) => `${stakingAction.amount}  LP tokens unstaked.`;
export const SUCCESS_UPDATE_VOTES = "Votes allocated.";
export const SUCCESS_REMOVE_VOTES = "Votes removed.";
export const SUCCESS_SUBMIT_PROPOSAL = "Proposal submitted.";
export const SUCCESS_CAST_VOTE = "Vote cast.";
export const SUCCESS_LOCK_OMM = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${Utils.timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCK_TIME = (lockingAction: LockingAction) => `OMM locked until ${Utils.timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCKED_OMM = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${Utils.timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${Utils.timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_MIGRATE_STAKED_OMM = (mngStkIcxAction: ManageStakedIcxAction) => `${mngStkIcxAction.amount} OMM locked until ${Utils.timestampInMillisecondsToPrettyDate(mngStkIcxAction.lockingTime)}.`;
export const SUCCESS_CLAIM_AND_APPLY_BOMM_BOOST = (ommClaimed: BigNumber | number) => `Claimed ${Utils.tooUSLocaleString(Utils.roundDownTo2Decimals(ommClaimed))} OMM. \nbOMM boost applied.`;
export const SUCCESS_APPLY_BOMM_BOOST = "bOMM boost applied.";

/*
 *  NOTIFICATIONS SHOWN AFTER TRANSACTION FAILURE
 */

export const FAILURE_BORROW_MAX = "This market has less than 10% liquidity. Borrow a smaller amount or try again later.";
export const FAILURE_ASSET_SUPPLIED = (assetAction: AssetAction, failedTxMessage: string) => `Couldn't supply ${assetAction.asset.tag}. ${failedTxMessage}`;
export const FAILURE_ASSET_WITHDRAWN = (assetAction: AssetAction, failedTxMessage: string) => `Couldn't withdraw ${assetAction.asset.tag}. ${failedTxMessage}`;
export const FAILURE_ASSET_BORROWED = (assetAction: AssetAction, failedTxMessage: string) => `Couldn't borrow ${assetAction.asset.tag}. ${failedTxMessage} `;
export const FAILURE_ASSET_REPAID = (assetAction: AssetAction, failedTxMessage: string) => `Couldn't repay ${assetAction.asset.tag}. ${failedTxMessage}`;
export const FAILURE_CLAIM_ICX = (failedTxMessage: string) => `Couldn't claim ICX. ${failedTxMessage}`;
export const FAILURE_CLAIM_OMM = (failedTxMessage: string) => `Couldn't claim rewards. ${failedTxMessage}`;
export const FAILURE_WITHDRAW_LOCKED_OMM = (failedTxMessage: string) => `Couldn't withdraw locked OMM. ${failedTxMessage}`;
export const FAILURE_CLAIM_AND_APPLY_BOMM_BOOST = "Couldn't apply boost. Claim rewards to try again.";
export const FAILURE_APPLY_BOMM_BOOST = "Couldn't apply boost. Claim rewards to try again.";
export const FAILURE_UNSTAKE_OMM = (failedTxMessage: string) => `Couldn't unstake OMM. ${failedTxMessage}`;
export const FAILURE_STAKE_LP = (failedTxMessage: string) => `Couldn't stake LP tokens. ${failedTxMessage}`;
export const FAILURE_UNSTAKE_LP = (failedTxMessage: string) => `Couldn't unstake LP tokens. ${failedTxMessage}`;
export const FAILURE_UPDATE_VOTES = (failedTxMessage: string) => `Couldn't allocate votes. ${failedTxMessage}`;
export const FAILURE_REMOVE_ALL_VOTES = (failedTxMessage: string) => `Couldn't remove votes. ${failedTxMessage}`;
export const FAILURE_SUBMIT_PROPOSAL = (failedTxMessage: string) => `Couldn't submit proposal. ${failedTxMessage}`;
export const FAILURE_CAST_VOTE = (failedTxMessage: string) => `Couldn't cast vote. ${failedTxMessage}`;
export const FAILURE_LOCK_OMM = (failedTxMessage: string) => `Couldn't lock up OMM. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_TIME = (failedTxMessage: string) => `Couldn't increase the lock-up period. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_OMM = (failedTxMessage: string) => `Couldn't lock up OMM. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT = (failedTxMessage: string) => `Couldn't lock up OMM or increase the lock-up period. ${failedTxMessage}`;
export const FAILURE_MANAGE_STAKED_OMM = "Couldn’t lock up staked OMM.";

/*
 * NEWLY ADDED MESSAGES
 */

// New proposal related messages
export const NEW_PROPOSAL_EMPTY_TITLE = "Add a title.";
export const NEW_PROPOSAL_EMPTY_DESCRIPTION = "Add a description.";
export const NEW_PROPOSAL_EMPTY_LINK = "Add a link to the proposal on the Omm forum.";
export const NEW_PROPOSAL_INVALID_LINK_DOMAIN = `Must link to a discussion on ${ommForumDomain}.`;
export const NEW_PROPOSAL_MIN_BOMM_REQUIRED = (minBommRequired: BigNumber) => `You need at least ${Utils.tooUSLocaleString(Utils.roundOffTo2Decimals(minBommRequired))} bOMM to propose a change.`;
export const NEW_PROPOSAL_EMPTY_CONTRACT = "Select a contract.";
export const NEW_PROPOSAL_EMPTY_METHOD = "Select a method.";
export const NEW_PROPOSAL_PARAMETERS = "Input a parameters.";
export const NEW_PROPOSAL_INVALID_PARAMETERS = "Invalid parameters. Make sure it's in valid json format.";


// Supply & Borrow related messages
export const CONFIRM_SUPPLY_NO_CHANGE = "No change in supplied value.";
export const CONFIRM_BORROW_NO_CHANGE = "No change in borrowed value.";

// Ledger related messages
export const LEDGER_NOT_SUPPORTED = "Couldn't connect to your Ledger device. WebUSB transport is not supported.";
export const LEDGER_WAIT_ADDRESS = "Waiting for you to confirm the address on your Ledger device... (60 seconds timeout)";
export const LEDGER_ERROR = "Couldn't detect your Ledger device. Make sure it's connected and try again.";
export const LEDGER_PLEASE_CONFIRM = "Confirm the transaction on your Ledger device.";
export const LEDGER_UNABLE_TO_SIGN_TX = "Couldn't sign the transaction with your Ledger device. Make sure it's connected and try again.";

// Header refresh related messages
export const PRE_DATA_REFRESH = "Refreshing data...";
export const SUCCESS_DATA_REFRESH = "Data refreshed.";
export const FAILURE_DATA_REFRESH = "Couldn't refresh the data.";

// Copy related messages
export const UNABLE_TO_COPY = "Couldn't copy address.";
export const SUCCESS_COPY = "Address copied.";

// OMM Locking related messages
export const LOCKED_VALUE_NO_CHANGE = "No change in locked OMM value.";
export const LOCKING_PERIOD_NOT_SELECTED = "Choose a lock-up period.";
export const TOO_LOW_LOCK_AMOUNT = (minLockAmount: BigNumber) => `You must lock up more than ${minLockAmount}`;
export const LOCK_AMOUNT_LOWER_THAN_CURRENT = "You can't lock up less OMM than you currently have locked.";

// Pool LP stake related message
export const NO_CHANGE_STAKED_VALUE = "No change in staked LP token value.";

// Voting related message
export const VOTE_LIST_NO_CHANGE = "Your vote list did not change.";
export const VOTE_LIST_MAX_PREP_VOTE = "You can't vote for more than 5 validators. Remove one from the list and try again.";
export const VOTE_LIST_PREP_ALREADY_SELECTED = "You've already chosen this validator.";

// Iconex related messages
export const ICONEX_WALLET_DOES_NOT_EXIST = "Wallet does not exist. Sign in to ICONex and try again.";

// Loading core user data related messages
export const FAILED_LOADING_USER_DATA = "Couldn't load your data. Try again in a moment.";
