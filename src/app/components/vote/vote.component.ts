import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/enums/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {OmmTokenBalanceDetails} from "../../models/classes/OmmTokenBalanceDetails";
import {VoteAndLockingService} from "../../services/vote/vote-and-locking.service";
import {Prep, PrepList} from "../../models/classes/Preps";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {YourPrepVote} from "../../models/classes/YourPrepVote";
import {NotificationService} from "../../services/notification/notification.service";
import {StakingAction} from "../../models/classes/StakingAction";
import {ModalAction, ModalStatus} from "../../models/classes/ModalAction";
import {SlidersService} from "../../services/sliders/sliders.service";
import {Utils} from "../../common/utils";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";
import {VoteAction} from "../../models/classes/VoteAction";
import {AssetTag} from "../../models/classes/Asset";
import {
  contributorsMap,
  defaultPrepLogoUrl,
  Times,
  lockedDatesToMilliseconds,
  lockedUntilDateOptions,
  lockedDateTobOmmPerOmm
} from "../../common/constants";
import {normalFormat} from "../../common/formats";
import BigNumber from "bignumber.js";
import {Proposal} from "../../models/classes/Proposal";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {Router} from "@angular/router";
import {LockDate} from "../../models/enums/LockDate";
import {LockingAction} from "../../models/classes/LockingAction";

declare var $: any;
declare var noUiSlider: any;

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent extends BaseClass implements OnInit, AfterViewInit {

  prepList?: PrepList = this.persistenceService.prepList;
  yourVotesPrepList: YourPrepVote[] = this.persistenceService.yourVotesPrepList;

  searchedPrepList: PrepList = this.persistenceService.prepList ?? new PrepList(new BigNumber("0"), new BigNumber("0"), [],
    new BigNumber("0"), new BigNumber("0"));
  searchInput = "";

  private inputLockOmm!: any; @ViewChild("lockInput")set c(c: ElementRef) {this.inputLockOmm = c.nativeElement; }
  private sliderStake!: any; @ViewChild("stkSlider")set d(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  lockDailyRewardsEl: any; @ViewChild("lockDailyRew") set e(e: ElementRef) {this.lockDailyRewardsEl = e?.nativeElement; }

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  userLockedOmmBalance = this.persistenceService.getUsersLockedOmmBalance().toNumber();

  // current state variables
  yourVotesEditMode = false;
  voteOverviewEditMode = false;
  lockAdjustActive = false; // flag that indicates whether the locked adjust is active (confirm and cancel shown)

  lockedUntilDateOptions = lockedUntilDateOptions;
  selectedLockTimeInMillisec = Times.WEEK_IN_MILLISECONDS; // default to 1 week
  selectedLockTime = LockDate.WEEK;
  userHasSelectedLockTime = false;

  yourVotingPower = new BigNumber(0);

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private voteService: VoteAndLockingService,
              public calculationsService: CalculationsService,
              private notificationService: NotificationService,
              private sliderService: SlidersService,
              private dataLoaderService: DataLoaderService,
              private cd: ChangeDetectorRef,
              public reloaderService: ReloaderService,
              private router: Router,
              private calculationService: CalculationsService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initSubscriptions();

    if (this.userLoggedIn()) {
      this.yourVotingPower = this.calculationService.usersVotingPower();
    }
  }

  ngAfterViewInit(): void {
    this.initLockSlider();
    this.resetStateValues();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    // this.cd.detectChanges();
  }

  private initSubscriptions(): void {
    this.subscribeToPrepListChange();
    this.subscribeToOmmTokenBalanceChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToModalActionResult();
    this.subscribeToYourVotesPrepChange();
    this.subscribeToUserDataReload();
  }

  // values that should be reset on re-init
  resetStateValues(): void {
    this.yourVotesEditMode = false;
    this.voteOverviewEditMode = false;

    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
  }

  private subscribeToUserDataReload(): void {
    this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.yourVotingPower = this.calculationService.usersVotingPower();
    });
  }

  private subscribeToModalActionResult(): void {
    this.stateChangeService.userModalActionResult.subscribe(res => {
      if (res.modalAction.modalType === ModalType.UPDATE_PREP_SELECTION
        || res.modalAction.modalType === ModalType.REMOVE_ALL_VOTES) {
        // if it failed
        if (res.status === ModalStatus.FAILED) {
          this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
        } else if (res.status === ModalStatus.CANCELLED) {
          this.yourVotesEditMode = true;
        }
      }
    });
  }

  private subscribeToYourVotesPrepChange(): void {
    this.stateChangeService.yourVotesPrepChange.subscribe(res => {
      this.yourVotesPrepList = [...res];
    });
  }

  private subscribeToPrepListChange(): void {
    // top 100 prep list has changed
    this.stateChangeService.prepListChange.subscribe((prepList: PrepList) => {
      this.prepList = prepList;
      this.onSearchInputChange("");
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      // set edit mode to false, disable slider and reset search
      this.onLockAdjustCancelClick();
      this.yourVotesEditMode = false;
      this.voteOverviewEditMode = false;
      this.sliderStake.setAttribute("disabled", "");
      this.onSearchInputChange("");
    });
  }

  private subscribeToOmmTokenBalanceChange(): void {
    this.stateChangeService.userOmmTokenBalanceDetailsChange.subscribe((res: OmmTokenBalanceDetails) => {
      log.debug(`subscribeToOmmTokenBalanceChange res:`, res);
      this.userOmmTokenBalanceDetails = res.getClone();
      log.debug(`this.userOmmTokenBalanceDetails:`, this.userOmmTokenBalanceDetails);

      // sliders max is sum of staked + available balance
      const sliderMax = Utils.add(this.persistenceService.getUsersLockedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.userOmmTokenBalanceDetails.stakedBalance.dp(0).toNumber()],
        range: { min: 0, max: sliderMax.isGreaterThan(Utils.ZERO) ? sliderMax.dp(0).toNumber() : 1 }
      });

      // assign staked balance to the current slider value
      log.debug(`subscribeToOmmTokenBalanceChange setting this.sliderStake to value :`, this.userOmmTokenBalanceDetails.stakedBalance);
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance.dp(0).toNumber());
    });
  }

  initLockSlider(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    const usersLockedOmmBalance = this.persistenceService.getUsersLockedOmmBalance();
    const userOmmAvailableBalance = this.persistenceService.getUsersAvailableOmmBalance();
    const max = Utils.add(usersLockedOmmBalance, userOmmAvailableBalance).dp(0);

    // create Stake slider
    if (this.sliderStake) {
      noUiSlider.create(this.sliderStake, {
        start: 0,
        padding: 0,
        connect: 'lower',
        range: {
          min: [0],
          max: [max.isZero() ? 1 : max.toNumber()]
        },
        step: 1,
      });
    }

    // slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = new BigNumber(values[handle]);

      if (value.lt(this.persistenceService.getUsersLockedOmmBalance())) {
        this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
        return;
      }

      if (this.lockDailyRewardsEl && this.userLoggedIn()) {
        this.updateUserDailyRewards(value);
      }

      if (this.userLoggedIn()) {
        this.yourVotingPower = this.calculateDynamicUserVotingPower(value);
      }

      // Update Omm stake input text box
      this.inputLockOmm.value = normalFormat.to(parseFloat(values[handle]));
    });
  }

  calculateDynamicUserVotingPower(newLockedOmmAmount: BigNumber): BigNumber {
    const currentLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const lockedOmmDiff = newLockedOmmAmount.minus(currentLockedOmm);
    const currentUserbOmmBalance = this.persistenceService.userbOmmBalance;
    const userbOMMBalance = lockedOmmDiff.multipliedBy(lockedDateTobOmmPerOmm(this.selectedLockTime)).plus(currentUserbOmmBalance);
    return this.calculationService.usersVotingPower(userbOMMBalance);
  }

  // Lock input updates the slider
  onInputLockChange(): void {
    log.debug("onInputLockChange: " + this.inputLockOmm.value);
    if (+normalFormat.from(this.inputLockOmm.value)) {
      this.sliderStake.noUiSlider.set(normalFormat.from(this.inputLockOmm.value));
    } else {
      this.sliderStake.noUiSlider.set(normalFormat.from("0"));
    }
  }

  // On OMM un-staking cancel click
  onCancelUnstakingClick(): void {
    const stakingAction = new StakingAction(Utils.ZERO, Utils.ZERO, this.persistenceService.getUserUnstakingOmmBalance0Rounded());
    this.modalService.showNewModal(ModalType.CANCEL_UNSTAKE_OMM_TOKENS, undefined, stakingAction);
  }

  // On "Lock up OMM" or "Adjust" click
  onLockAdjustClick(): void {
    this.onLockAdjustCancelClick();
    this.lockAdjustActive = true;

    this.sliderStake.removeAttribute("disabled");
  }

  // On "Cancel Lock up OMM" click
  onLockAdjustCancelClick(): void {
    this.lockAdjustActive = false;
    this.userHasSelectedLockTime = false;

    // Set your locked OMM slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.getUsersLockedOmmBalance().toNumber());
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
      this.notificationService.showNewNotification("Your vote list did not change.");
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
      this.notificationService.showNewNotification("You can't vote for more than 5 P-Reps");
    } else if (this.prepAlreadyInYourVotes(prep)) {
      this.notificationService.showNewNotification("Prep already in your votes.");
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

  userHasOmmTokens(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).isGreaterThan(Utils.ZERO);
  }

  userHasMoreThanOneOmmToken(): boolean {
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber("0")).isGreaterThan(new BigNumber("1"));
  }

  userHasStaked(): boolean {
    return this.persistenceService.getUsersLockedOmmBalance().isGreaterThan(Utils.ZERO);
  }

  votingPower(): BigNumber {
    return this.calculationsService.votingPower();
  }

  totalbOmm(): BigNumber {
    return this.persistenceService.bOmmTotalSupply.dp(2);
  }

  ommVotingPower(): BigNumber {
    return this.calculationService.ommVotingPower();
  }

  isMaxStaked(): boolean {
    return new BigNumber(this.sliderStake?.noUiSlider?.options.range.max).isEqualTo(this.userOmmTokenBalanceDetails?.stakedBalance ?? -1);
  }

  isUnstaking(): boolean {
    return this.persistenceService.getUserUnstakingOmmBalance0Rounded().isGreaterThan(Utils.ZERO);
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

  onSearchInputChange(searchInput: string): void {
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
          if (prep.name.toLowerCase().includes(this.searchInput)) {
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
    return (this.persistenceService.getUsersLockedOmmBalance().multipliedBy((yourPrepVote.percentage
      .dividedBy(new BigNumber("100"))).multipliedBy(this.votingPower()))).dp(2);
  }

  getLatestProposals(): Proposal[] {
    return this.persistenceService.proposalList.slice(0, 3);
  }

  getPrepsUSDReward(prep: Prep, index: number): BigNumber {
    const prepsIcxReward = this.getPrepsIcxReward(prep, index);
    const icxExchangePrice = this.persistenceService.getAssetExchangePrice(AssetTag.ICX);
    return prepsIcxReward.multipliedBy(icxExchangePrice);
  }

  getPrepsIcxReward(prep: Prep, index: number): BigNumber {
    if (!this.prepList) {
      return new BigNumber("0");
    }

    return this.calculationsService.calculatePrepsIcxReward(prep, this.prepList, index);
  }

  isPrepOmmContributor(address: string): boolean {
    return contributorsMap.get(address) ?? false;
  }

  getPowerPercent(prep: any): BigNumber {
    return prep.power.dividedBy(this.searchedPrepList.totalPower);
  }

  getYourStakeMax(): BigNumber {
    // sliders max is sum of staked + available balance
    return Utils.add(this.persistenceService.getUsersLockedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());
  }

  getLogoUrl(address: string): string {
    return this.persistenceService.prepList?.prepAddressToLogoUrlMap.get(address) ?? defaultPrepLogoUrl;
  }

  prepIsInYourVotes(prep: Prep): boolean {
    for (const p of this.yourVotesPrepList) {
      if (p.address === prep.address) {
        return true;
      }
    }
    return false;
  }

  errorHandlerPrepLogo($event: any): void {
    $event.target.src = defaultPrepLogoUrl;
  }

  onProposalClick(proposal: Proposal): void {
    this.router.navigate(["vote/proposal", proposal.id.toString()]);
  }

  /**
   * BOOSTED OMM
   */

  lockDate(): BigNumber {
    if (this.userCurrentLockedOmmEndInMilliseconds().gt(0)) {
      if (this.userHasSelectedLockTime) {
        return this.userCurrentLockedOmmEndInMilliseconds().plus(this.selectedLockTimeInMillisec);
      } else {
        return this.userCurrentLockedOmmEndInMilliseconds();
      }
    } else {
      return Utils.timestampNowMilliseconds().plus(this.selectedLockTimeInMillisec);
    }
  }

  onConfirmLockOmmClick(): void {
    log.debug(`onConfirmLockOmmClick Omm locked amount = ${this.userLockedOmmBalance}`);
    const before = this.persistenceService.getUsersLockedOmmBalance().toNumber();
    const after = this.userLockedOmmBalance;
    const diff = after - before;

    // if before and after equal show notification
    if (before === after && this.lockDate().eq(this.userCurrentLockedOmmEndInMilliseconds())) {
      this.notificationService.showNewNotification("No change in locked value.");
      return;
    }

    if (!this.selectedLockTimeInMillisec.isFinite() || this.selectedLockTimeInMillisec.lte(0)) {
      this.notificationService.showNewNotification("Please selected locking period.");
      return;
    }

    const unlockPeriod = this.lockDate();
    log.debug("unlockPeriod:", unlockPeriod);

    const lockingAction = new LockingAction(before, after, Math.abs(diff), unlockPeriod);

    if (diff >= 0) {
      if (this.persistenceService.minOmmLockAmount.isGreaterThan(diff)
        && !unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {

        this.notificationService.showNewNotification(`Lock amount must be greater than ${this.persistenceService.minOmmLockAmount}`);
      }
      else if (before > 0 && after > before && unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {
        // increase both locked amount and unlock period if lock amount and unlock period are greater than current
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_TIME_AND_AMOUNT, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else if (before > 0 && after > before && unlockPeriod.eq(this.userCurrentLockedOmmEndInMilliseconds())) {
        // increase lock amount only if new one is greater and unlock period is same as current
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_OMM, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else if (before === after && unlockPeriod.gt(this.userCurrentLockedOmmEndInMilliseconds())) {
        this.modalService.showNewModal(ModalType.INCREASE_LOCK_TIME, undefined, undefined, undefined, undefined,
          lockingAction);
      }
      else {
        this.modalService.showNewModal(ModalType.LOCK_OMM, undefined, undefined, undefined, undefined,
          lockingAction);
      }
    } else {
      this.notificationService.showNewNotification("Lock amount can not be lower than locked amount.");
    }
  }

  onLockedDateDropdownClick(): void {
    $(".dropdown-content.locked-selector").toggleClass('active');
  }

  onLockUntilDateClick(date: LockDate): void {
    this.selectedLockTimeInMillisec = lockedDatesToMilliseconds.get(date) ?? Times.WEEK_IN_MILLISECONDS;
    this.selectedLockTime = date;
    this.userHasSelectedLockTime = true;

    // update dynamic daily OMM rewards based on the newly selected lock date
    this.updateUserDailyRewards(new BigNumber(this.userLockedOmmBalance));
  }

  updateUserDailyRewards(value: BigNumber): void {
    const dailyUsersOmmLockingRewards = this.calculationService.calculateUserDailyLockingOmmRewards(value, this.selectedLockTime);

    // set daily rewards text to dynamic value by replacing inner HTML
    this.setText(this.lockDailyRewardsEl, this.formatNumberToUSLocaleString(dailyUsersOmmLockingRewards.dp(2))
      + (dailyUsersOmmLockingRewards.isGreaterThan(Utils.ZERO) ? " OMM " : ""));
  }

  boostAdjustLabel(): string {
    if (this.userHasLockedOmm()) {
      return "Adjust";
    } else {
      return "Lock up OMM";
    }
  }

  shouldHideBoostedSlider(): boolean {
    return !this.userLoggedIn() || !this.userHasOmmTokens() || !this.userHasMoreThanOneOmmToken();
  }

  boostedOmmPanelMessage(): string {
    if (!this.userLoggedIn()) {
      // signed out / hold no OMM
      return "Earn or buy OMM, then lock it up here to boost your earning potential and voting power.";
    } else if (this.userLoggedIn() && (this.userHasLockedOmm() || this.userHasOmmTokens())) {
      // unlocked OMM (no market or LP participation)
      return "Lock up OMM to boost your earning potential.";
    }

    return "Earn or buy OMM, then lock it up here to boost your earning potential and voting power.";
  }

  getLeftLockedThresholdPercentStyle(): any {
    const max = new BigNumber("96.7");
    const userLockedOmm = this.persistenceService.getUsersLockedOmmBalance();
    const percent = userLockedOmm.dividedBy(userLockedOmm.plus(this.persistenceService.getUsersAvailableOmmBalance()));
    const res = max.multipliedBy(percent).dp(2);
    return { left: res.toString() + "%" };
  }

  userHasLockedOmm(): boolean {
    return this.persistenceService.getUsersLockedOmmBalance().gt(0);
  }

  userBOMMbalance(): BigNumber {
    return this.persistenceService.userbOmmBalance;
  }

  userCurrentLockedOmmEndInMilliseconds(): BigNumber {
    return this.persistenceService.userLockedOmm?.end.dividedBy(1000) ?? new BigNumber(0);
  }

  getLockSliderMax(): BigNumber {
    // sliders max is sum of locked + available balance
    return Utils.add(this.persistenceService.getUsersLockedOmmBalance(),
      this.persistenceService.getUsersAvailableOmmBalance());
  }

  shouldHideLockedOmmThreshold(): boolean {
    return !this.userLoggedIn() || !this.userHasLockedOmm() || !this.lockAdjustActive;
  }
}
