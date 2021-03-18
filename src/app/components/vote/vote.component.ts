import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {normalFormat} from "../../common/formats";
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
import {VoteAction} from "../../models/VoteAction";
import {ModalAction} from "../../models/ModalAction";
import {SlidersService} from "../../services/sliders/sliders.service";
import {Utils} from "../../common/utils";
import {DataLoaderService} from "../../services/data-loader/data-loader.service";

declare var noUiSlider: any;
declare var wNumb: any;
declare var $: any;

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent extends BaseClass implements OnInit, AfterViewInit {

  prepList?: PrepList;
  yourVotesPrepList: YourPrepVote[] = [];

  searchedPrepList?: PrepList;
  searchInput = "";

  @ViewChild("stkSlider")set sliderStakeSetter(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  private sliderStake!: any;

  @ViewChild("ommStk")set ommStakeAmountSetter(ommStake: ElementRef) {this.ommStakeAmount = ommStake.nativeElement; }
  private ommStakeAmount?: any;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  // current state variables
  yourVotesEditMode = false;
  voteOverviewEditMode = false;
  prepListIsLoading = false;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private voteService: VoteService,
              public calculationsService: CalculationsService,
              private notificationService: NotificationService,
              private sliderService: SlidersService,
              private dataLoaderService: DataLoaderService) {
    super(persistenceService);

    this.loadPrepList();
    this.initYourVotePrepList();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initStakeSlider();
    this.subscribeToLoginChange();
    this.subscribeToOmmTokenBalanceChange();
    this.subscribeToUserModalActionChange();
    this.resetStateValues();

    this.dataLoaderService.loadGovernanceData();
  }

  // values that should be reset on re-init
  resetStateValues(): void {
    this.yourVotesEditMode = false;
    this.prepListIsLoading = false;
  }

  initYourVotePrepList(): void {
    // TODO: fetch and load real values
    this.persistenceService.yourVotesPrepList = [];

    // initialize this components dynamic yourVotesPrepList
    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
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

  private subscribeToLoginChange(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) { // user logged in
        this.loadUserDelegationDetails();
      } else {
        // user logged out
      }
    });
  }

  private subscribeToOmmTokenBalanceChange(): void {
    this.stateChangeService.userOmmTokenBalanceDetailsChange.subscribe((res: OmmTokenBalanceDetails) => {
      log.debug(`subscribeToOmmTokenBalanceChange res:`, res);
      this.userOmmTokenBalanceDetails = res.getClone();
      log.debug(`this.userOmmTokenBalanceDetails:`, this.userOmmTokenBalanceDetails);

      // sliders max is sum of staked + available balance
      const sliderMax = Utils.addDecimalsPrecision(this.userOmmTokenBalanceDetails.stakedBalance,
        this.userOmmTokenBalanceDetails.availableBalance);

      this.sliderStake.noUiSlider.updateOptions({
        start: [this.userOmmTokenBalanceDetails.stakedBalance],
        range: { min: 0, max: sliderMax > 0 ? sliderMax : 1 }
      });

      // assign staked balance to the current slider value
      log.debug(`subscribeToOmmTokenBalanceChange setting this.sliderStake to value :`, this.userOmmTokenBalanceDetails.stakedBalance);
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance);
    });
  }

  initStakeSlider(): void {
    const currentUserOmmStakedBalance = this.userOmmTokenBalanceDetails?.stakedBalance ?? 0;
    const userOmmAvailableBalance = this.roundDownTo2Decimals(this.persistenceService.userOmmTokenBalanceDetails?.availableBalance ?? 0);
    const max = Utils.addDecimalsPrecision(currentUserOmmStakedBalance, userOmmAvailableBalance);

    // Stake slider
    this.sliderService.createNoUiSlider(this.sliderStake, 0, 0, 'lower', undefined, {
        min: [0],
        max: [max === 0 ? 0.1 : max]
      });

    // slider slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance);
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];

      log.debug("update this.sliderStake value to:", value);

      if (this.userOmmTokenBalanceDetails) {
        this.userOmmTokenBalanceDetails.stakedBalance = value;
      }

      // Update OMM stake values as ICX
      $('.value-icx-stake-amount').text(normalFormat.to(value * 1.3));
    });
  }

  onSignInClick(): void {
    this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  // On "Stake" click
  onStakeAdjustClick(): void {
    // Add "adjust" class
    this.voteOverviewEditMode = true;

    // Set your P-Rep sliders to initial values
    $(this.sliderStake).removeAttr("disabled");
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
    const before = this.roundDownTo2Decimals(this.persistenceService.getUsersStakedOmmBalance());
    const after = this.roundDownTo2Decimals(this.userOmmTokenBalanceDetails?.stakedBalance ?? 0);

    // if before and after equal show notification
    if (before === after) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const diff = Utils.subtractDecimalsWithPrecision(after, before);

    const voteAction = new VoteAction(before, after, Math.abs(diff));

    if (diff > 0) {
      this.modalService.showNewModal(ModalType.STAKE_OMM_TOKENS, undefined, voteAction);
    } else {
      this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS, undefined, voteAction);
    }
  }

  onConfirmSavePrepClick(): void {
    if (this.voteListsAreEqual()) {
      this.notificationService.showNewNotification("Your vote list did not change.");
      return;
    }
    else if (this.listIsNotNullOrEmpty(this.yourVotesPrepList)) {
      this.modalService.showNewModal(ModalType.ADD_PREP_SELECTION);
    } else {
      this.modalService.showNewModal(ModalType.REMOVE_ALL_VOTES);
    }
  }

  onConfirmRemovePrepClick(): void {
    this.modalService.showNewModal(ModalType.REMOVE_PREP_SELECTION);
  }

  private loadPrepList(start: number = 1, end: number = 100): void {
    this.voteService.getListOfPreps(start, end).then(prepList => {
      this.persistenceService.prepList = prepList;
      this.prepList = prepList;
      this.searchedPrepList = prepList;
      this.prepListIsLoading = false;
    }).catch(e => {
      this.prepListIsLoading = false;
      log.error("Failed to load prep list... Details:");
      log.error(e);
    });
  }

  private loadUserDelegationDetails(): void {
    this.voteService.getUserDelegationDetails().then(delegationDetails => {
      // TODO!!!
    }).catch(e => {
      log.error("Failed to load user delegation details:");
      log.error(e);
    });
  }

  removeYourVotePrep(index: number): void {
    // remove prep from list
    this.yourVotesPrepList.splice(index, 1);
  }

  addYourVotePrep(prep: Prep): void {
    if (this.yourVotesPrepList.length >= 5) {
      this.notificationService.showNewNotification("You can only vote for 5 preps.");
    } else {
      this.yourVotesPrepList.push(new YourPrepVote(prep.address, prep.name, 65));
    }
  }

  resetYourVotePreps(): void {
    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
  }

  userHasOmmTokens(): boolean {
    const userOmmTokenBalance = this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0;
    return userOmmTokenBalance > 0;
  }

  userHasStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance() > 0;
  }

  userVotingPower(): number {
    const userStakedBalance = this.userOmmTokenBalanceDetails?.stakedBalance ?? 0;
    return this.calculationsService.yourVotingPower(userStakedBalance);

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
      this.searchedPrepList = this.prepList;

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
}
