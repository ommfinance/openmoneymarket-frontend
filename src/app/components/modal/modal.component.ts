import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../../services/modal/modal.service";
import {Subscription} from "rxjs";
import {ModalType} from "../../models/ModalType";
import {IconexApiService} from "../../services/iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {ModalAction} from "../../models/ModalAction";
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
import {AssetTag} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {LedgerService} from "../../services/ledger/ledger.service";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import log from "loglevel";
import {TransactionDispatcherService} from "../../services/transaction-dispatcher/transaction-dispatcher.service";
import {OmmService} from "../../services/omm/omm.service";
import {VoteService} from "../../services/vote/vote.service";


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent extends BaseClass implements OnInit {

  @ViewChild('signInModal', { static: true }) signInModal!: ElementRef;
  @ViewChild('stakeOmm', { static: true }) stakeOmmTokensModal!: ElementRef;
  @ViewChild('unstakeOmm', { static: true }) unstakeOmmTokensModal!: ElementRef;
  @ViewChild('updateVotes', { static: true }) updatePrepModal!: ElementRef;
  @ViewChild('rmvPrep', { static: true }) removePrepModal!: ElementRef;
  @ViewChild('assetActionModal', { static: true }) assetActionModal!: ElementRef;
  @ViewChild('iconWithdrawModal', { static: true }) iconWithdrawModal!: ElementRef;
  @ViewChild('claimOmmRewardsModal', { static: true }) claimOmmRewardsModal!: ElementRef;
  @ViewChild('ledgerAddressList', { static: true }) LedgerAddressListModal!: ElementRef;


  activeModalSubscription: Subscription;
  activeModal?: HTMLElement;
  activeModalChange?: ModalAction;

  withdrawOption = "unstake";

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
              private transactionDispatcherService: TransactionDispatcherService,
              private ommService: OmmService,
              private voteService: VoteService) {
    super(persistenceService);

    this.activeModalSubscription = this.modalService.activeModalChange$.subscribe((activeModalChange: ModalAction) => {
      switch (activeModalChange.modalType) {
        case ModalType.SIGN_IN:
          this.setActiveModal(this.signInModal.nativeElement, activeModalChange);
          break;
        case ModalType.CLAIM_OMM_REWARDS:
          this.setActiveModal(this.claimOmmRewardsModal.nativeElement, activeModalChange);
          break;
        case ModalType.STAKE_OMM_TOKENS:
          this.setActiveModal(this.stakeOmmTokensModal.nativeElement, activeModalChange);
          break;
        case ModalType.UNSTAKE_OMM_TOKENS:
          this.setActiveModal(this.unstakeOmmTokensModal.nativeElement, activeModalChange);
          break;
        case ModalType.UPDATE_PREP_SELECTION:
          this.setActiveModal(this.updatePrepModal.nativeElement, activeModalChange);
          break;
        case ModalType.REMOVE_ALL_VOTES:
          this.setActiveModal(this.removePrepModal.nativeElement, activeModalChange);
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
    this.iconexApiService.hasAccount();
  }

  onSignInBridgeClick(): void {
    this.modalService.hideActiveModal();
    this.bridgeWidgetService.openBridgeWidget();
  }

  onSignInLedgerClick(): void {
    this.modalService.hideActiveModal();

    // set default pagination values
    this.activeLedgerAddressWindow = 0;
    this.selectedLedgerAddressPage = 0;
    this.activeLedgerAddressPageList = [0, 1, 2, 3, 4];

    this.fetchLedgerWallets();
  }

  onSelectLedgerAddressClick(wallet: LedgerWallet): void {
    this.modalService.hideActiveModal();
    this.dataLoaderService.walletLogin(wallet);
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

    this.ledgerService.getLedgerWallets(this.selectedLedgerAddressPage).then(wallets => {
      this.ledgerWallets = wallets;
      this.setActiveModal(this.LedgerAddressListModal.nativeElement, undefined);
      this.modalService.showModal(this.activeModal);
    }).catch(e => {
      log.error(e);
      this.notificationService.showNewNotification("Can not get Icon addresses from Ledger device." +
        " Make sure it is connected and try again.");
    });
  }

  formatIconAddressToShort(address: string): string {
    const length = address.length;
    return address.substring(0, 9) + "..." + address.substring(length - 7, length);
  }

  onClaimOmmRewardsClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();

    this.transactionDispatcherService.dispatchTransaction(this.ommService.BuildClaimOmmRewardsTx(), "Claiming Omm Tokens...");
  }

  onConfirmUpdateVotesClick(): void {
    // store user action in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    // hide current modal
    this.modalService.hideActiveModal();
    const tx = this.voteService.buildUpdateUserDelegationPreferencesTx(
      this.activeModalChange!.voteAction!.yourVotesPrepList);

    // this.transactionDispatcherService.dispatchTransaction(this.voteService.buildUpdateUserDelegationPreferencesTx(
    //   this.activeModalChange!.voteAction!.yourVotesPrepList), "Allocating votes...");

    // TODO!!!
    //
    // <!-- Notification: Votes succeded -->
    // <div class="panel notification">
    //   <p>Votes allocated.</p>
    // </div>
    //
    // <!-- Notification: Votes failed -->
    // <div class="panel notification">
    //   <p>Couldn't allocate your votes. Try again.</p>
    // </div>
    //
  }

  onCancelClick(): void {
    this.modalService.hideActiveModal();
  }

  riskGreaterThanZero(): boolean {
    if (this.activeModalChange?.assetAction?.risk) {
      return this.activeModalChange.assetAction.risk > 0;
    } else {
      return false;
    }
  }

  isIcxWithdraw(activeModalChange: ModalAction): boolean {
    return activeModalChange.modalType === ModalType.WITHDRAW && activeModalChange.assetAction?.asset.tag === AssetTag.ICX;
  }

  isBorrow(): boolean {
    return this.activeModalChange?.modalType === ModalType.BORROW;
  }

  isIconSupply(): boolean {
    return this.activeModalChange?.modalType === ModalType.SUPPLY && this.activeModalChange.assetAction?.asset.tag === AssetTag.ICX;
  }

  isWithdrawIcxModal(): boolean {
    return this.activeModalChange?.modalType === ModalType.WITHDRAW && this.activeModalChange.assetAction?.asset.tag === AssetTag.ICX;
  }

  ledgerIcxBalance(wallet: LedgerWallet): number {
    return wallet.balances.get(AssetTag.ICX) ?? 0;
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

  onAssetModalActionConfirmClick(): void {
    // store activeModalChange in local storage
    this.localStorageService.persistModalAction(this.activeModalChange!);

    const assetTag = this.activeModalChange!.assetAction!.asset.tag;
    switch (this.activeModalChange?.modalType) {
      case ModalType.BORROW:
        this.borrowService.borrowAsset(this.activeModalChange!.assetAction!.amount, assetTag, `Borrowing ${assetTag}...`);
        break;
      case ModalType.SUPPLY:
        this.supplyService.supplyAsset(this.activeModalChange!.assetAction!.amount, assetTag, `Supplying ${assetTag}...`);
        break;
      case ModalType.REPAY:
        this.repayService.repayAsset(this.activeModalChange!.assetAction!.amount, assetTag, `Repaying ${assetTag}...`);
        break;
      case ModalType.WITHDRAW:
        this.withdrawService.withdrawAsset(this.activeModalChange!.assetAction!.amount, assetTag, this.waitForUnstakingIcx(),
          `Withdrawing ${assetTag}...`);
        break;
      default:
        throw new OmmError(`onAssetModalActionConfirmClick() -> Invalid modal type: ${this.activeModalChange?.modalType}`);
    }

    // commit modal action change
    this.stateChangeService.updateUserModalAction(this.activeModalChange);

    // hide current modal
    this.modalService.hideActiveModal();
  }

  private waitForUnstakingIcx(): boolean {
    const waitForUnstaking = this.withdrawOption === "unstake";
    log.debug(`waitForUnstaking = ${waitForUnstaking}`);

    return waitForUnstaking;
  }

}
