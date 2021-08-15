import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";
import log from "loglevel";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {VoteService} from "../../services/vote/vote.service";
import {Prep, PrepList} from "../../models/Preps";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {YourPrepVote} from "../../models/YourPrepVote";
import {NotificationService} from "../../services/notification/notification.service";
import {StakingAction} from "../../models/StakingAction";
import {ModalAction, ModalStatus} from "../../models/ModalAction";
import {SlidersService} from "../../services/sliders/sliders.service";
import {Utils} from "../../common/utils";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";
import {VoteAction} from "../../models/VoteAction";
import {AssetTag} from "../../models/Asset";
import {contributorsMap} from "../../common/constants";
import {normalFormat} from "../../common/formats";

declare var noUiSlider: any;

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent extends BaseClass implements OnInit, AfterViewInit {

  prepList?: PrepList = this.persistenceService.prepList;
  yourVotesPrepList: YourPrepVote[] = this.persistenceService.yourVotesPrepList;

  searchedPrepList: PrepList = this.persistenceService.prepList ?? new PrepList(0, 0, []);
  searchInput = "";

  @ViewChild("stkSlider")set sliderStakeSetter(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  private sliderStake!: any;

  @ViewChild("stakeInput")set stakeInputSetter(stakeInput: ElementRef) {this.inputStakeOmm = stakeInput.nativeElement; }
  private inputStakeOmm!: any;

  @ViewChild("ommStk")set ommStakeAmountSetter(ommStake: ElementRef) {this.ommStakeAmount = ommStake.nativeElement; }
  private ommStakeAmount?: any;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  votingPower = this.calculationsService.votingPower();

  // current state variables
  yourVotesEditMode = false;
  voteOverviewEditMode = false;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private voteService: VoteService,
              public calculationsService: CalculationsService,
              private notificationService: NotificationService,
              private sliderService: SlidersService,
              private dataLoaderService: DataLoaderService,
              private cd: ChangeDetectorRef) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initSubscriptions();
  }

  ngAfterViewInit(): void {
    this.initStakeSlider();
    this.resetStateValues();

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  private initSubscriptions(): void {
    this.subscribeToPrepListChange();
    this.subscribeToOmmTokenBalanceChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToModalActionResult();
    this.subscribeToYourVotesPrepChange();
  }

  // values that should be reset on re-init
  resetStateValues(): void {
    this.yourVotesEditMode = false;
    this.voteOverviewEditMode = false;

    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
    this.votingPower = this.calculationsService.votingPower();
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
      const sliderMax = Utils.addDecimalsPrecision(this.persistenceService.getUsersStakedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.userOmmTokenBalanceDetails.stakedBalance],
        range: { min: 0, max: sliderMax > 0 ? sliderMax : 1 }
      });

      // assign staked balance to the current slider value
      log.debug(`subscribeToOmmTokenBalanceChange setting this.sliderStake to value :`, this.userOmmTokenBalanceDetails.stakedBalance);
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance);

      // calculate voting power
      this.votingPower = this.calculationsService.votingPower();
    });
  }

  initStakeSlider(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails?.getClone();
    const currentUserOmmStakedBalance = this.persistenceService.getUsersStakedOmmBalance();
    const userOmmAvailableBalance = this.persistenceService.getUsersAvailableOmmBalance();
    const max = Utils.addDecimalsPrecision(currentUserOmmStakedBalance, userOmmAvailableBalance);

    // create Stake slider
    if (this.sliderStake) {
      noUiSlider.create(this.sliderStake, {
        start: 0,
        padding: 0,
        connect: 'lower',
        range: {
          min: [0],
          max: [max === 0 ? 1 : max]
        },
        step: 1,
      });
    }

    // slider slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails.stakedBalance));
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];

      // Update Omm stake input text box
      this.inputStakeOmm.value = normalFormat.to(parseFloat(values[handle]));

      if (this.userOmmTokenBalanceDetails) {
        this.userOmmTokenBalanceDetails.stakedBalance = value;
      }
    });
  }

  // Stake input updates the slider
  onInputStakeOmmChange(): void {
    log.debug("onInputStakeOmmChange: " + this.inputStakeOmm.value);
    if (+this.inputStakeOmm.value) {
      this.sliderStake.noUiSlider.set(normalFormat.from(this.inputStakeOmm.value));
    } else {
      this.sliderStake.noUiSlider.set(normalFormat.from("0"));
    }
  }

  onSignInClick(): void {
    this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  // On "Stake" click
  onStakeAdjustClick(): void {
    // Add "adjust" class
    this.voteOverviewEditMode = true;

    // Set your P-Rep sliders to initial values
    this.sliderStake.removeAttribute("disabled");
  }

  // On "Cancel Stake" click
  onStakeAdjustCancelClick(): void {
    // Remove "adjust" class
    this.voteOverviewEditMode = false;

    // Set your stake slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.getUsersStakedOmmBalance());
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

  onConfirmStakeClick(): void {
    log.debug(`onConfirmStakeClick Omm stake amount = ${this.userOmmTokenBalanceDetails?.stakedBalance}`);
    const before = this.roundDownToZeroDecimals(this.persistenceService.getUsersStakedOmmBalance());
    log.debug("before = ", before);
    const after = this.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails?.stakedBalance ?? 0);
    log.debug("after = ", after);
    const diff = Utils.subtractDecimalsWithPrecision(after, before, 0);
    log.debug("Diff = ", diff);

    // if before and after equal show notification
    if (before === after) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const voteAction = new StakingAction(before, after, Math.abs(diff));

    if (diff > 0) {
      if (this.persistenceService.minOmmStakeAmount > diff) {
        this.notificationService.showNewNotification(`Stake amount must be greater than ${this.persistenceService.minOmmStakeAmount}`);
      } else {
        this.modalService.showNewModal(ModalType.STAKE_OMM_TOKENS, undefined, voteAction);
      }
    } else {
      this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS, undefined, voteAction);
    }
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
      this.notificationService.showNewNotification("You can only vote for 5 preps.");
    } else if (this.prepAlreadyInYourVotes(prep)) {
      this.notificationService.showNewNotification("Prep already in your votes.");
    } else {
      this.yourVotesEditMode = true;
      const newPrepVote = new YourPrepVote(prep.address, prep.name, 0);
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
    return (this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0) > 0;
  }

  userHasStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance() > 0;
  }

  userVotingPower(): number {
    if (this.userLoggedIn()) {
      return this.votingPower * (this.userOmmTokenBalanceDetails?.stakedBalance ?? 0);
    } else {
      return 0;
    }
  }

  ommVotingPower(): number {
    const totalLiquidityIcx = this.persistenceService.getAssetReserveData(AssetTag.ICX)?.totalLiquidity ?? 0;
    const totalBorrowedIcx = this.persistenceService.getAssetReserveData(AssetTag.ICX)?.totalBorrows ?? 0;
    return this.convertSICXToICX(totalLiquidityIcx - totalBorrowedIcx);
  }

  isMaxStaked(): boolean {
    return this.sliderStake?.noUiSlider?.options.range.max === this.userOmmTokenBalanceDetails?.stakedBalance;
  }

  isUnstaking(): boolean {
    return this.persistenceService.getUserUnstakingOmmBalance() > 0;
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
    log.debug("this.searchInput = ", searchInput);
    this.searchInput = searchInput;

    if (this.searchInput.trim() === "") {
      log.debug("this.searchInput.trim() === ");
      this.searchedPrepList = this.prepList ?? new PrepList(0, 0, []);

      log.debug(`searchedPrepList:`);
      log.debug(this.searchedPrepList);
    } else {
      if (this.prepList) {
        this.searchedPrepList = new PrepList(this.prepList.totalDelegated, this.prepList.totalStake, []);
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

    let percentage = Utils.divideDecimalsPrecision(1, yourVotesPrepList.length);

    const percentageSumIs100 = this.percentageSumIs100(percentage, yourVotesPrepList.length);

    for (let i = 0; i < yourVotesPrepList.length; i++) {
      if (i === yourVotesPrepList.length - 1 && !percentageSumIs100) {
        percentage = Utils.addDecimalsPrecision(percentage, Utils.subtractDecimalsWithPrecision(1,
          Utils.multiplyDecimalsPrecision(percentage, yourVotesPrepList.length)));
      }

      yourVotesPrepList[i].percentage = Utils.multiplyDecimalsPrecision(percentage, 100);
    }
  }

  private percentageSumIs100(percentage: number, count: number): boolean {
    return Utils.multiplyDecimalsPrecision(percentage, count) === 1;
  }

  getDelegationAmount(yourPrepVote: YourPrepVote): number {
    return Utils.roundOffTo2Decimals(this.persistenceService.getUsersStakedOmmBalance() * (yourPrepVote.percentage / 100)
      * this.votingPower);
  }

  // TODO: in case we want infinity scrolling for preps list
  // @HostListener("window:scroll", [])
  // onScroll(): void {
  //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
  //     // Load Your Data Here
  //     log.debug("Load more Preps");
  //     const currentPrepListLength = this.persistenceService.prepList?.preps.length ?? 1;
  //     this.loadPrepList(currentPrepListLength, currentPrepListLength + 21);
  //   }
  // }

  getPrepsUSDReward(prep: Prep): string {
    const prepsIcxReward = this.calculationsService.calculatePrepsIcxReward(prep, this.searchedPrepList);
    const icxExchangePrice = this.persistenceService.getAssetExchangePrice(AssetTag.ICX);
    return this.formatNumberToUSLocaleString((prepsIcxReward * icxExchangePrice).toFixed(0));
  }

  getPrepsIcxReward(prep: Prep): string {
    const prepsIcxReward = this.calculationsService.calculatePrepsIcxReward(prep, this.searchedPrepList).toFixed(0);
    return this.formatNumberToUSLocaleString(prepsIcxReward);
  }

  isPrepOmmContributor(address: string): boolean {
    return contributorsMap.get(address) ?? false;
  }

  getYourStakeMax(): number {
    // sliders max is sum of staked + available balance
    return Utils.addDecimalsPrecision(this.persistenceService.getUsersStakedOmmBalance(),
        this.persistenceService.getUsersAvailableOmmBalance());
  }

  prepIsInYourVotes(prep: Prep): boolean {
    for (const p of this.yourVotesPrepList) {
      if (p.address === prep.address) {
        return true;
      }
    }
    return false;
  }
}
