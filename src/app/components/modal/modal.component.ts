import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";
import {ModalType} from "../../models/ModalType";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {ModalAction, ModalActionsResult, ModalStatus} from "../../models/ModalAction";
import {BaseClass} from "../base-class";
import {BORROW, REPAY, SUPPLY, WITHDRAW} from "../../common/constants";
import {SupplyService} from "../../services/supply/supply.service";
import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {RepayService} from "../../services/repay/repay.service";
import {OmmError} from "../../core/errors/OmmError";
import {LocalStorageService} from "../../services/local-storage/local-storage.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {NotificationService} from "../../services/notification/notification.service";
import {AssetTag, assetToCollateralAssetTag, CollateralAssetTag} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {LedgerService} from "../../services/ledger/ledger.service";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import log from "loglevel";
import {TransactionDispatcherService} from "../../services/transaction-dispatcher/transaction-dispatcher.service";
import {OmmService} from "../../services/omm/omm.service";
import {VoteService} from "../../services/vote/vote.service";
import {LoginService} from "../../services/login/login.service";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {ClaimIcxService} from "../../services/claim-icx/claim-icx.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {StakeLpService} from "../../services/stake-lp/stake-lp.service";
import {Utils} from "../../common/utils";
import BigNumber from "bignumber.js";


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent extends BaseClass implements OnInit {

  @ViewChild('signInModal', { static: true }) signInModal!: ElementRef;
  @ViewChild('stakeOmm', { static: true }) stakeOmmTokensModal!: ElementRef;
  @ViewChild('unstakeOmm', { static: true }) unstakeOmmTokensModal!: ElementRef;
  @ViewChild('cancelUnstake', { static: true }) cancelUnstakeOmmTokensModal!: ElementRef;
  @ViewChild('updateVotes', { static: true }) updatePrepModal!: ElementRef;
  @ViewChild('rmvPrep', { static: true }) removePrepModal!: ElementRef;
  @ViewChild('assetActionModal', { static: true }) assetActionModal!: ElementRef;
  @ViewChild('iconWithdrawModal', { static: true }) iconWithdrawModal!: ElementRef;
  @ViewChild('claimOmmRewardsModal', { static: true }) claimOmmRewardsModal!: ElementRef;
  @ViewChild('claimIcxModal', { static: true }) claimIcxModal!: ElementRef;
  @ViewChild('ledgerAddressList', { static: true }) LedgerAddressListModal!: ElementRef;
  @ViewChild('modalLoading', { static: true }) modalLoading!: ElementRef;
  @ViewChild('poolStakeModal', { static: true }) poolStakeModal!: ElementRef;
  @ViewChild('poolUnstakeModal', { static: true }) poolUnstakeModal!: ElementRef;
  @ViewChild('submitProposal', { static: true }) submitProposalModal!: ElementRef;
  @ViewChild('submitVote', { static: true }) submitVoteModal!: ElementRef;

  activeModalSubscription: Subscription;
  activeModal?: HTMLElement;
  activeModalChange?: ModalAction;

  withdrawOption: "unstake" | "keep" = "keep";

  // window on which user is on (e.g. 1st = [0, 1, 2, 3, 4])
  activeLedgerAddressWindow = 0;
  activeLedgerAddressPageList = [0, 1, 2, 3, 4];
  // page that the user has selected
  selectedLedgerAddressPage = 0;
  // default window and page size
  ledgerAddressPageSize = 5;


  ledgerWallets: LedgerWallet[] = [];

  constructor(private modalService: ModalService,
              private iconexApiService: IconexApiService,
              private bridgeWidgetService: BridgeWidgetService,
              private supplyService: SupplyService,
              private withdrawService: WithdrawService,
              private borrowService: BorrowService,
              private repayService: RepayService,
              private localStorageService: LocalStorageService,
              private stateChangeService: StateChangeService,
              private notificationService: NotificationService,
              public persistenceService: PersistenceService,
              private ledgerService: LedgerService,
              private dataLoaderService: DataLoaderService,
              private loginService: LoginService,
              private transactionDispatcherService: TransactionDispatcherService,
              private ommService: OmmService,
              private voteService: VoteService,
              private claimIcxService: ClaimIcxService,
              private calculationService: CalculationsService,
              private stakeLpService: StakeLpService) {
    super(persistenceService);

    this.activeModalSubscription = this.modalService.activeModalChange$.subscribe((activeModalChange: ModalAction) => {
      switch (activeModalChange.modalType) {
        case ModalType.SIGN_IN:
          this.setActiveModal(this.signInModal.nativeElement, activeModalChange);
          break;
        case ModalType.CLAIM_OMM_REWARDS:
          this.setActiveModal(this.claimOmmRewardsModal.nativeElement, activeModalChange);
          break;
        case ModalType.CLAIM_ICX:
          this.setActiveModal(this.claimIcxModal.nativeElement, activeModalChange);
          break;
        case ModalType.STAKE_OMM_TOKENS:
          this.setActiveModal(this.stakeOmmTokensModal.nativeElement, activeModalChange);
          break;
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.setActiveModal(this.unstakeOmmTokensModal.nativeElement, activeModalChange);
          break;
        case ModalType.CANCEL_UNSTAKE_OMM_TOKENS:
          this.setActiveModal(this.cancelUnstakeOmmTokensModal.nativeElement, activeModalChange);
          break;
        case ModalType.UPDATE_PREP_SELECTION:
          this.setActiveModal(this.updatePrepModal.nativeElement, activeModalChange);
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.setActiveModal(this.removePrepModal.nativeElement, activeModalChange);
          break;
        case ModalType.POOL_STAKE:
          this.setActiveModal(this.poolStakeModal.nativeElement, activeModalChange);
          break;
        case ModalType.POOL_UNSTAKE:
          this.setActiveModal(this.poolUnstakeModal.nativeElement, activeModalChange);
          break;
        case ModalType.SUBMIT_PROPOSAL:
          this.setActiveModal(this.submitProposalModal.nativeElement, activeModalChange);
          break;
        case ModalType.CAST_VOTE:
          this.setActiveModal(this.submitVoteModal.nativeElement, activeModalChange);
          break;
        case ModalType.CANCEL_VOTE:
          this.setActiveModal(this.submitVoteModal.nativeElement, activeModalChange);
          break;
        default:
          // check if it is ICX withdraw action and show corresponding specific view / modal
          if (this.isIcxWithdraw(activeModalChange)) {
            this.setActiveModal(this.iconWithdrawModal.nativeElement, activeModalChange);
          } else {
            this.setActiveModal(this.assetActionModal.nativeElement, activeModalChange);
          }
      }

      this.modalService.showModal(this.activeModal);
    });
  }

  ngOnInit(): void {
  }

  private setActiveModal(htmlElement: any, activeModalChange?: ModalAction): void {
    this.activeModal = htmlElement;
    this.activeModalChange = activeModalChange;
  }

  onSignInIconexClick(): void {
    this.modalService.hideActiveModal();

    // if user has wallet extension request account address
    if (this.iconexApiService.hasWalletExtension) {
      this.iconexApiService.hasAccount();
    } else {
      // redirect to Hana extension link else
      window.open("https://chrome.google.com/webstore/detail/hana/jfdlamikmbghhapbgfoogdffldioobgl?hl=en", "_blank");
    }
  }

  onSignInBridgeClick(): void {
    this.modalService.hideActiveModal();
    this.bridgeWidgetService.openBridgeWidget();
  }

  onSignInLedgerClick(): void {
    // set default pagination values
    this.activeLedgerAddressWindow = 0;
    this.selectedLedgerAddressPage = 0;
    this.activeLedgerAddressPageList = [0, 1, 2, 3, 4];

    this.fetchLedgerWallets();
  }

  onSelectLedgerAddressClick(wallet: LedgerWallet): void {
    this.modalService.hideActiveModal();
    this.loginService.walletLogin(wallet);
  }

  onLedgerAddressPageClick(page: number): void {
    this.selectedLedgerAddressPage = page;
    this.fetchLedgerWallets();
  }

  onLedgerPageNextClick(): void {
    this.activeLedgerAddressWindow += 1;
    this.activeLedgerAddressPageList = [];

    const start = this.activeLedgerAddressWindow * this.ledgerAddressPageSize;
    const end = this.activeLedgerAddressWindow * this.ledgerAddressPageSize + this.ledgerAddressPageSize;

    for (let i = start; i <= end; i++) {
      this.activeLedgerAddressPageList.push(i);
    }

    log.debug("******** onLedgerPageNextClick ********");
    log.debug(`activeLedgerAddressWindow = ${this.activeLedgerAddressWindow}`);
    log.debug(`activeLedgerAddressPageList = ${this.activeLedgerAddressPageList}`);
    log.debug(`selectedLedgerAddressPage = ${this.activeLedgerAddressPageList[0]}`);

    this.selectedLedgerAddressPage = this.activeLedgerAddressPageList[0];

    this.fetchLedgerWallets();
  }

  onLedgerPageBackClick(): void {
    if (this.activeLedgerAddressWindow === 0 && this.selectedLedgerAddressPage === 0) {
      return;
    }

    this.activeLedgerAddressWindow -= 1;
    this.activeLedgerAddressPageList = [];

    const start = this.activeLedgerAddressWindow * this.ledgerAddressPageSize;
    const end = this.activeLedgerAddressWindow * this.ledgerAddressPageSize + this.ledgerAddressPageSize;

    for (let i = start; i <= end; i++) {
      this.activeLedgerAddressPageList.push(i);
    }

    this.selectedLedgerAddressPage = this.activeLedgerAddressPageList[0];

    this.fetchLedgerWallets();
  }

  fetchLedgerWallets(): void {
    this.modalService.hideActiveModal();
    this.showLoadingModal();

    this.ledgerService.getLedgerWallets(this.selectedLedgerAddressPage).then(wallets => {
      this.ledgerWallets = wallets;

      this.modalService.hideActiveModal();
      this.setActiveModal(this.LedgerAddressListModal.nativeElement, undefined);
      this.modalService.showModal(this.activeModal);
    }).catch(e => {
      this.modalService.hideActiveModal();
      log.error(e);
      this.notificationService.showNewNotification("Couldn’t detect Ledger.\n" +
        "Make sure it’s connected and try again.");
    });
  }

  onClaimOmmRewardsClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();

    this.transactionDispatcherService.dispatchTransaction(this.ommService.buildClaimOmmRewardsTx(), "Claiming Omm Tokens...");
  }

  onSubmitProposalClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();

    const proposal = this.activeModalChange?.governanceAction?.newProposal!;

    const now = Utils.timestampNowMicroseconds();
    proposal.snapshot = Utils.addSecondsToTimestamp(now, 60);
    proposal.voteStart = Utils.addSecondsToTimestamp(now, 62);

    this.transactionDispatcherService.dispatchTransaction(this.voteService.createProposal(proposal), "Submitting proposal...");
  }

  onClaimIcxClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();

    this.transactionDispatcherService.dispatchTransaction(this.claimIcxService.buildClaimUnstakedIcxTx(), "Claiming ICX...");
  }

  onCancelClick(): void {
    this.stateChangeService.userModalActionResult.next(new ModalActionsResult(this.activeModalChange!, ModalStatus.CANCELLED));
    this.modalService.hideActiveModal();
  }

  riskGreaterThanZero(): boolean {
    if (this.activeModalChange?.assetAction?.risk) {
      return this.activeModalChange.assetAction.risk.isGreaterThan(Utils.ZERO);
    } else {
      return false;
    }
  }

  isIcxWithdraw(activeModalChange: ModalAction): boolean {
    return activeModalChange.modalType === ModalType.WITHDRAW && (activeModalChange.assetAction?.asset.tag === AssetTag.ICX
      || activeModalChange.assetAction?.asset.tag === CollateralAssetTag.sICX);
  }

  isBorrow(): boolean {
    return this.activeModalChange?.modalType === ModalType.BORROW;
  }

  isIconSupply(): boolean {
    return this.activeModalChange?.modalType === ModalType.SUPPLY && this.activeModalChange.assetAction?.asset.tag === AssetTag.ICX;
  }

  showSupplyIsNotCollateralized(): boolean {
    const collateralEnabled = this.persistenceService.getAssetReserveData(this.activeModalChange?.assetAction?.asset.tag)
      ?.usageAsCollateralEnabled ?? false;
    return this.activeModalChange?.modalType === ModalType.SUPPLY && !collateralEnabled;
  }

  isWithdrawIcxModal(): boolean {
    return this.activeModalChange?.modalType === ModalType.WITHDRAW && this.activeModalChange.assetAction?.asset.tag === AssetTag.ICX;
  }

  ledgerIcxBalance(wallet: LedgerWallet): BigNumber {
    return wallet.balances.get(AssetTag.ICX) ?? new BigNumber("0");
  }

  getModalActionName(): string {
    switch (this.activeModalChange?.modalType) {
      case ModalType.BORROW:
        return BORROW;
      case ModalType.SUPPLY:
        return SUPPLY;
      case ModalType.REPAY:
        return REPAY;
      case ModalType.WITHDRAW:
        return WITHDRAW;
      default:
        return "";
    }
  }

  onConfirmUpdateVotesClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    switch (this.activeModalChange?.modalType) {
      case ModalType.UPDATE_PREP_SELECTION:
        this.transactionDispatcherService.dispatchTransaction(this.voteService.buildUpdateUserDelegationPreferencesTx(
          this.activeModalChange.voteAction!.yourVotesPrepList), "Allocating votes...");
        break;
      case ModalType.REMOVE_ALL_VOTES:
        this.transactionDispatcherService.dispatchTransaction(this.voteService.buildRemoveAllVotes(),
          "Removing all votes...");
        break;
      default:
        throw new OmmError(`onConfirmUpdateVotesClick() -> Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  onGovernanceModalConfirmClick(): void {
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    switch (this.activeModalChange?.modalType) {
      case ModalType.STAKE_OMM_TOKENS:
        this.voteService.stakeOmm(this.activeModalChange!.stakingAction!.after, "Staking Omm Tokens...");
        break;
      case ModalType.UNSTAKE_OMM_TOKENS:
        this.voteService.unstakeOmm(this.activeModalChange!.stakingAction!.amount, "Starting unstaking process...");
        break;
      default:
        throw new OmmError(` onGovernanceModalConfirmClick() -> Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  onSubmitVoteClick(): void {
    if (this.userVotingWeight().isLessThanOrEqualTo(0)) {
      return;
    }
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    const action = this.activeModalChange!.governanceAction!;
    this.voteService.castVote(action.proposalId!, action.approveProposal!, "Casting your vote...");

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  onRestakeConfirmClick(): void {
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    this.voteService.cancelUnstakeOmm(this.activeModalChange!.stakingAction!.amount, "Restaking Omm Tokens…");

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  onPoolStakingClick(): void {
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);
    const action = this.activeModalChange!.stakingAction;
    const poolId = action?.payload.poolId;
    let amount;

    switch (this.activeModalChange?.modalType) {
      case ModalType.POOL_STAKE:
        amount = action?.payload.max ? this.persistenceService.getUserPoolStakedAvailableBalance(poolId) : action!.amount;
        this.stakeLpService.stakeLp(poolId, amount, "Staking LP Tokens...");
        break;
      case ModalType.POOL_UNSTAKE:
        amount = action?.payload.min ? this.persistenceService.getUserPoolStakedBalance(poolId) : action!.amount;
        this.stakeLpService.unstakeLp(poolId, amount, "Starting unstaking process...");
        break;
      default:
        throw new OmmError(` onGovernanceModalConfirmClick() -> Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  onAssetModalActionConfirmClick(): void {
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    const assetTag = this.activeModalChange!.assetAction!.asset.tag;
    switch (this.activeModalChange?.modalType) {
      case ModalType.BORROW:
        this.borrowService.borrowAsset(this.activeModalChange.assetAction!.amount, assetTag, `Borrowing ${assetTag}...`);
        break;
      case ModalType.SUPPLY:
        this.supplyService.supplyAsset(this.activeModalChange.assetAction!.amount, assetTag, `Supplying ${assetTag}...`);
        break;
      case ModalType.REPAY:
        this.repayService.repayAsset(this.activeModalChange, assetTag, `Repaying ${assetTag}...`);
        break;
      case ModalType.WITHDRAW:
        const amount = this.activeModalChange.assetAction!.after.isZero() ? new BigNumber("-1") :
          this.activeModalChange.assetAction!.amount;
        this.withdrawService.withdrawAsset(amount, assetTag, this.waitForUnstakingIcx(),
          `Withdrawing ${assetTag}...`);
        break;
      default:
        throw new OmmError(`onAssetModalActionConfirmClick() -> Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange);

    // hide current modal if not Iconex wallet
    if (!(this.persistenceService.activeWallet instanceof IconexWallet)) {
      this.modalService.hideActiveModal();
    }
  }

  private waitForUnstakingIcx(): boolean {
    const waitForUnstaking = this.withdrawOption === "unstake";
    log.debug(`waitForUnstaking = ${waitForUnstaking}`);

    return waitForUnstaking;
  }

  showLoadingModal(): void {
    this.modalService.showModal(this.modalLoading.nativeElement);
  }

  activeModalHasLiquidityRewards(): boolean {
    const liquidityRewards = this.activeModalChange?.assetAction?.details?.ommRewards?.liquidity?.total ?? new BigNumber("0");
    return liquidityRewards.isGreaterThan(Utils.ZERO);
  }

  getAdjustedAssetTag(): AssetTag | CollateralAssetTag | undefined {
    if (this.activeModalChange?.assetAction) {
      const tag = this.activeModalChange.assetAction.asset.tag;

      // convert ICX borrow repay to sICX
      if (tag === AssetTag.ICX && (this.activeModalChange.modalType === ModalType.BORROW
        || this.activeModalChange.modalType === ModalType.REPAY)) {
        return assetToCollateralAssetTag(tag);
      } else {
        return tag;
      }
    } else {
      return undefined;
    }
  }

  getBorrowFee(): BigNumber {
    return this.calculationService.calculateBorrowFee(this.activeModalChange?.assetAction?.amount);
  }

  getAssetActionAmount(): BigNumber {
    return this.activeModalChange?.assetAction?.amount ?? new BigNumber("0");
  }

  assetActionAssetTag(): AssetTag | CollateralAssetTag {
    return this.activeModalChange?.assetAction?.asset.tag ?? "";
  }

  assetIsCollateralSIcx(): boolean {
    return this.activeModalChange?.assetAction?.asset.tag === CollateralAssetTag.sICX;
  }

  isProposalApprove(): boolean {
    return this.activeModalChange?.governanceAction?.approveProposal ?? false;
  }

  isGovernanceVoteModal(): boolean {
    return this.activeModalChange?.modalType === ModalType.CAST_VOTE;
  }

  userVotingWeight(): BigNumber {
    return this.persistenceService.userVotingWeightForProposal.get(this.activeModalChange?.governanceAction?.proposalId
      ?? new BigNumber(-1)) ?? new BigNumber("0");

  }

  userHasEnoughOmmStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance().gte(this.persistenceService.getMinOmmStakedRequiredForProposal());
  }

  getVoteDuration(): string {
    return Utils.getVoteDurationTime(this.persistenceService.voteDuration);
  }
}
