import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/enums/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Prep, PrepList} from "../../models/classes/Preps";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {YourPrepVote} from "../../models/classes/YourPrepVote";
import {NotificationService} from "../../services/notification/notification.service";
import {ModalAction, ModalStatus} from "../../models/classes/ModalAction";
import {Utils} from "../../common/utils";
import {VoteAction} from "../../models/classes/VoteAction";
import {
  contributorsMap,
  defaultPrepLogoUrl, prepsOfferingIncentiveMap, Times
} from "../../common/constants";
import BigNumber from "bignumber.js";
import {Proposal} from "../../models/classes/Proposal";
import {LockDate} from "../../models/enums/LockDate";
import {OmmLockingComponent} from "../omm-locking/omm-locking.component";
import {OmmLockingCmpType} from "../../models/enums/OmmLockingComponent";
import {ManageStakedIcxAction} from "../../models/classes/ManageStakedIcxAction";
import {VOTE_LIST_MAX_PREP_VOTE, VOTE_LIST_NO_CHANGE, VOTE_LIST_PREP_ALREADY_SELECTED} from "../../common/messages";
import {Subscription} from "rxjs";


@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
})
export class VoteComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  latestProposals: Proposal[] = [];

  prepList?: PrepList = this.persistenceService.prepList;
  yourVotesPrepList: YourPrepVote[] = this.persistenceService.yourVotesPrepList;

  searchedPrepList: PrepList = this.persistenceService.prepList ?? new PrepList(new BigNumber("0"), new BigNumber("0"), [],
    new BigNumber("0"), new BigNumber("0"));
  searchInput = "";

  private yourVotingPowerEl: any; @ViewChild("yourVotPow")set b(b: ElementRef) {this.yourVotingPowerEl = b.nativeElement; }
  private votingPowerPerIcxEl: any; @ViewChild("votPwrPerIcx")set c(c: ElementRef) {this.votingPowerPerIcxEl = c.nativeElement; }

  @ViewChild(OmmLockingComponent) ommLockingComponent!: OmmLockingComponent;

  // current state variables
  yourVotesEditMode = false;
  voteOverviewEditMode = false;

  yourVotingPower = new BigNumber(0);

  votingPower = new BigNumber(0);
  ommVotingPower = new BigNumber(0);
  bOmmTotalSupply = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);

  /** Subscriptions */
  coreDataReloadSub?: Subscription;
  userDataReloadSub?: Subscription;
  modalActionResultSub?: Subscription;
  modalActionChangeSub?: Subscription;
  userLoginSub?: Subscription;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              public calculationsService: CalculationsService,
              private notificationService: NotificationService,
              private cdRef: ChangeDetectorRef,
              private calculationService: CalculationsService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initCoreStaticValues();
    this.initSubscriptions();
    this.initUserStaticValues();

    // pop up manage staked omm
    this.popupStakedMigrationModal();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.coreDataReloadSub?.unsubscribe();
    this.userDataReloadSub?.unsubscribe();
    this.modalActionResultSub?.unsubscribe();
    this.modalActionChangeSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
  }

  private initSubscriptions(): void {
    this.subscribeToCoreDataReload();
    this.subscribeToUserModalActionChange();
    this.subscribeToModalActionResult();
    this.subscribeToAfterUserDataReload();
    this.subscribeToUserLogin();
  }

  private subscribeToUserLogin(): void {
    this.userLoginSub = this.stateChangeService.loginChange$.subscribe(wallet => {
      if (!wallet) {
        this.resetVotingPowerPerIcx();
        this.resetYourVotingPower();
      } else {
        // pop up manage staked omm
        this.popupStakedMigrationModal();
      }
    });
  }

  private subscribeToAfterUserDataReload(): void {
    this.userDataReloadSub = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.initUserStaticValues();
      this.cdRef.detectChanges();
    });
  }

  public subscribeToCoreDataReload(): void {
    this.coreDataReloadSub = this.stateChangeService.afterCoreDataReload$.subscribe(() => {
      this.initCoreStaticValues();
      this.cdRef.detectChanges();
    });
  }

  initCoreStaticValues(): void {
    this.bOmmTotalSupply = this.persistenceService.bOmmTotalSupply;
    this.delegationbOmmWorkingTotalSupply = this.persistenceService.delegationbOmmWorkingTotalSupply;
    this.latestProposals = this.persistenceService.proposalList.slice(0, 3);
    this.yourVotesEditMode = false;
    this.voteOverviewEditMode = false;
    this.votingPower = this.calculationsService.votingPower();
    this.setVotingPowerPerIcx(this.votingPower);
    this.ommVotingPower = this.calculationsService.ommVotingPower();
    this.prepList = this.persistenceService.prepList;
    this.onSearchInputChange("");
  }

  initUserStaticValues(): void {
    if (this.userLoggedIn()) {
      this.yourVotingPower = this.calculationsService.usersVotingPower();
      this.setYourVotingPower(this.yourVotingPower);
      // reset the your prep votes list
      this.resetYourVotePreps();
    }
  }

  private subscribeToModalActionResult(): void {
    this.modalActionResultSub = this.stateChangeService.userModalActionResult.subscribe(res => {
      if (res.modalAction.modalType === ModalType.UPDATE_PREP_SELECTION
        || res.modalAction.modalType === ModalType.REMOVE_ALL_VOTES) {
        // if it failed
        if (res.status === ModalStatus.FAILED) {
          this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
          this.cdRef.detectChanges();
        } else if (res.status === ModalStatus.CANCELLED) {
          this.yourVotesEditMode = true;
        }
      }
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.modalActionChangeSub = this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      this.ommLockingComponent.onLockAdjustCancelClick();

      // set edit mode to false, disable slider and reset search
      this.yourVotesEditMode = false;
      this.voteOverviewEditMode = false;
      this.onSearchInputChange("");
    });
  }

  popupStakedMigrationModal(): void {
    // pop up manage staked omm
    if (this.userLoggedIn() && this.persistenceService.getUserStakedOmmBalance().gt(0)) {
      // default migration locking period is 1 week
      const lockTime = this.calculationService.recalculateLockPeriodEnd(Utils.timestampNowMilliseconds().plus(Times.WEEK_IN_MILLISECONDS));
      const amount = this.persistenceService.getUserStakedOmmBalance();
      this.modalService.showNewModal(ModalType.MANAGE_STAKED_OMM, undefined, undefined, undefined,
        undefined, undefined, new ManageStakedIcxAction(amount, lockTime));
    }
  }

  handleLockSliderValueUpdate(value: number): void {
    const bigNumValue = new BigNumber(value);

    // update dynamic values only if user current and dynamic locked OMM amounts are different
    if (this.userLoggedIn() && !this.userLockedOmmBalance().eq(bigNumValue.dp(0)))  {
      // Update User daily Omm rewards
      if (this.yourVotingPower) {
        this.updateYourVotingPower(bigNumValue);
      }

      if (this.votingPowerPerIcxEl) {
        this.updateVotingPowerPerIcx(bigNumValue);
      }
    }
  }

  handleLockAdjustCancelClicked(): void {
    this.updateYourVotingPower(this.userLockedOmmBalance());
    this.updateVotingPowerPerIcx(this.userLockedOmmBalance());
  }

  // On "Adjust votes" click
  onAdjustVoteClick(): void {
    this.yourVotesEditMode = true;
  }

  // On "Cancel adjust votes" click
  onCancelAdjustVotesClick(): void {
    this.yourVotesEditMode = false;

    // reset the your prep votes list
    this.resetYourVotePreps();
  }

  onConfirmSavePrepClick(): void {
    if (this.voteListsAreEqual()) {
      this.notificationService.showNewNotification(VOTE_LIST_NO_CHANGE);
    }
    else if (this.listIsNotNullOrEmpty(this.yourVotesPrepList)) {
      this.yourVotesEditMode = false;
      const voteAction = new VoteAction(this.yourVotesPrepList);
      this.modalService.showNewModal(ModalType.UPDATE_PREP_SELECTION, undefined, undefined, voteAction);
    } else {
      this.yourVotesEditMode = false;
      this.modalService.showNewModal(ModalType.REMOVE_ALL_VOTES, undefined, undefined, new VoteAction([]));
    }
  }

  removeYourVotePrepByIndex(index: number): void {
    // remove prep from list
    this.yourVotesPrepList.splice(index, 1);
    this.fillYourVotePercentages(this.yourVotesPrepList);
  }

  removeYourVotePrepByAddress(prep: Prep): void {
    // remove prep from list
    let index = 0;
    for (let i = 0; i < this.yourVotesPrepList.length; i++) {
      if (this.yourVotesPrepList[i].address === prep.address) {
        index = i;
        break;
      }
    }

    this.yourVotesPrepList.splice(index, 1);
    this.fillYourVotePercentages(this.yourVotesPrepList);
  }

  addYourVotePrep(prep: Prep): void {
    if (this.yourVotesPrepList.length >= 5) {
      this.notificationService.showNewNotification(VOTE_LIST_MAX_PREP_VOTE);
    } else if (this.prepAlreadyInYourVotes(prep)) {
      this.notificationService.showNewNotification(VOTE_LIST_PREP_ALREADY_SELECTED);
    } else {
      this.yourVotesEditMode = true;
      const newPrepVote = new YourPrepVote(prep.address, prep.name, new BigNumber("0"));
      this.yourVotesPrepList.push(newPrepVote);
      this.fillYourVotePercentages(this.yourVotesPrepList);
    }
  }

  prepAlreadyInYourVotes(prep: Prep): boolean {
    for (const yourVote of this.yourVotesPrepList) {
      if (prep.address === yourVote.address) { return true; }
    }
    return false;
  }

  resetYourVotePreps(): void {
    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
    this.fillYourVotePercentages(this.yourVotesPrepList);
  }

  userHasLockedOmm(): boolean {
    return this.persistenceService.getUsersLockedOmmBalance().isGreaterThan(Utils.ZERO);
  }

  userLockedOmmBalance(): BigNumber {
    return this.persistenceService.getUsersLockedOmmBalance();
  }

  totalDelegationWorkingbOmm(): BigNumber {
    return this.delegationbOmmWorkingTotalSupply;
  }

  userHasVotedForPrep(): boolean {
    return this.yourVotesPrepList && this.yourVotesPrepList.length > 0;
  }

  voteListsAreEqual(): boolean {
    if (this.yourVotesPrepList && this.persistenceService.yourVotesPrepList) {
      if (this.yourVotesPrepList.length !== this.persistenceService.yourVotesPrepList.length) {
        return false;
      } else {
        for (let i = 0; i < this.yourVotesPrepList.length ; i++) {
          if (this.yourVotesPrepList[i].address !== this.persistenceService.yourVotesPrepList[i].address) {
            return false;
          }
        }
        return true;
      }
    } else {
      return false;
    }
  }

  onSearchInputChange(searchInput: string, incentivisedOnly = false): void {
    this.searchInput = searchInput;

    if (this.searchInput.trim() === "") {
      this.searchedPrepList = this.prepList ?? new PrepList(new BigNumber("0"), new BigNumber("0"), [], new BigNumber("0"),
        new BigNumber("0"));

      log.debug(this.searchedPrepList);
    } else {
      if (this.prepList) {
        this.searchedPrepList = new PrepList(this.prepList.totalDelegated, this.prepList.totalStake, [], this.prepList.avgIRep,
          this.prepList.totalPower);
        const searchedPreps: Prep[] = [];

        this.prepList?.preps.forEach(prep => {
          if (incentivisedOnly) {
            if (prepsOfferingIncentiveMap.get(prep.address)) {
              searchedPreps.push(prep);
            }
          }
          else if (prep.name.toLowerCase().includes(this.searchInput)) {
            searchedPreps.push(prep);
          }
        });

        if (this.searchedPrepList) {
          this.searchedPrepList.preps = searchedPreps;
        }
      }
    }
  }

  private fillYourVotePercentages(yourVotesPrepList: YourPrepVote[]): void {
    if (yourVotesPrepList.length === 0) { return; }

    const percentage = Utils.divide(new BigNumber("1"), new BigNumber(yourVotesPrepList.length));

    yourVotesPrepList.forEach(yourVote => {
      yourVote.percentage = Utils.multiply(percentage, new BigNumber("100"));
    });
  }

  getDelegationAmount(yourPrepVote: YourPrepVote): BigNumber {
    return (this.yourVotingPower.multipliedBy((yourPrepVote.percentage
      .dividedBy(new BigNumber("100"))))).dp(2);
  }

  isPrepOmmContributor(address: string): boolean {
    return contributorsMap.get(address) ?? false;
  }

  isPrepOfferingIncentive(address: string): boolean {
    return prepsOfferingIncentiveMap.get(address) ?? false;
  }

  getLogoUrl(address: string): string {
    return this.persistenceService.prepList?.prepAddressToLogoUrlMap.get(address) ?? defaultPrepLogoUrl;
  }

  getOmmLckCmpType(): OmmLockingCmpType {
    return OmmLockingCmpType.VOTE;
  }

  errorHandlerPrepLogo($event: any): void {
    $event.target.src = defaultPrepLogoUrl;
  }

  /**
   * BOOSTED OMM
   */

  onLockUntilDateClick(): void {
    this.updateYourVotingPower(this.ommLockingComponent.dynamicLockedOmmAmount);
    this.updateVotingPowerPerIcx(this.ommLockingComponent.dynamicLockedOmmAmount);
  }

  updateYourVotingPower(newLockedOmmAmount: BigNumber, date?: LockDate): void {
    const newUserbOmmBalance = this.calculationService.calculateNewbOmmBalance(newLockedOmmAmount,
      this.ommLockingComponent.selectedLockTimeInMillisec);
    const yourVotingPower = this.calculationsService.usersVotingPower(newUserbOmmBalance);

    this.setYourVotingPower(yourVotingPower);
  }

  setYourVotingPower(yourVotingPower: BigNumber): void {
    this.setText(this.yourVotingPowerEl, this.tooUSLocaleString(yourVotingPower.dp(2))
      + (yourVotingPower.isGreaterThan(Utils.ZERO) ? " ICX " : ""));
  }

  resetYourVotingPower(): void {
    this.setText(this.yourVotingPowerEl, "-");
  }

  updateVotingPowerPerIcx(newLockedOmmAmount: BigNumber, date?: LockDate): void {
    const newUserbOmmBalance = this.calculationService.calculateNewbOmmBalance(newLockedOmmAmount,
      this.ommLockingComponent.selectedLockTimeInMillisec);
    const votingPower = this.calculationsService.votingPower(newUserbOmmBalance);
    this.setVotingPowerPerIcx(votingPower);
  }

  resetVotingPowerPerIcx(): void {
    this.setVotingPowerPerIcx(this.votingPower);
  }

  setVotingPowerPerIcx(votingPower: BigNumber): void {
    const text = `1 bOMM = ${this.tooUSLocaleString(votingPower.dp(2))} ICX`;
    this.setText(this.votingPowerPerIcxEl, text);
  }
}
