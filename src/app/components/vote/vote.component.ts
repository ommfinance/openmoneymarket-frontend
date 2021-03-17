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

  @ViewChild("sliderStake")set sliderStakeSetter(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  private sliderStake?: any;

  @ViewChild("ommStk")set ommStakeAmountSetter(ommStake: ElementRef) {this.ommStakeAmount = ommStake.nativeElement; }
  private ommStakeAmount?: any;

  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  testUserOmmTokenBalanceDetails = new OmmTokenBalanceDetails(110, 100, 10, 0, 0);

  // current state variables
  yourVotesEditMode = false;
  prepListIsLoading = false;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private voteService: VoteService,
              public calculationsService: CalculationsService,
              private notificationService: NotificationService) {
    super(persistenceService);

    // TODO change when not testing!
    this.userOmmTokenBalanceDetails = this.testUserOmmTokenBalanceDetails;
    this.persistenceService.userOmmTokenBalanceDetails = new OmmTokenBalanceDetails(
      this.testUserOmmTokenBalanceDetails.totalBalance,
      this.testUserOmmTokenBalanceDetails.availableBalance,
      this.testUserOmmTokenBalanceDetails.stakedBalance,
      this.testUserOmmTokenBalanceDetails.unstakingBalance,
      0);
    // this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails;

    this.loadPrepList();
    this.initYourVotePrepList();
  }

  ngOnInit(): void {
    this.subscribeToLoginChange();
    this.subscribeToOmmTokenBalanceChange();
  }

  ngAfterViewInit(): void {
    // TODO change when not testing!
    this.userOmmTokenBalanceDetails = this.testUserOmmTokenBalanceDetails;
    // this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails;

    this.initStakeSlider();

    this.resetStateValues();
  }

  // values that should be reset on re-init
  resetStateValues(): void {
    this.yourVotesEditMode = false;
    this.prepListIsLoading = false;
  }

  initYourVotePrepList(): void {
    // TODO: fetch and load real values
    this.persistenceService.yourVotesPrepList = [];
    // this.persistenceService.yourVotesPrepList.push(
    //   new YourPrepVote("", "Icon Foundation",  65),
    //   new YourPrepVote("", "ICX_Station",  65),
    //   new YourPrepVote("", "VELIC",  65),
    // );

    // initialize this components dynamic yourVotesPrepList
    this.yourVotesPrepList = [...this.persistenceService.yourVotesPrepList];
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
      // TODO change when not testing!
      res = this.testUserOmmTokenBalanceDetails;
      this.persistenceService.userOmmTokenBalanceDetails = new OmmTokenBalanceDetails(
        this.testUserOmmTokenBalanceDetails.totalBalance,
        this.testUserOmmTokenBalanceDetails.availableBalance,
        this.testUserOmmTokenBalanceDetails.stakedBalance,
        this.testUserOmmTokenBalanceDetails.unstakingBalance,
        0);

      this.userOmmTokenBalanceDetails = res;

      // sliders max is sum of staked + available balance
      const sliderMax = res.stakedBalance + res.availableBalance;
      this.sliderStake.noUiSlider.updateOptions({
        range: { min: 0, max: sliderMax > 0 ? sliderMax : 1 }
      });

      // assign staked balance to the current slider value
      this.sliderStake.noUiSlider.set(res.stakedBalance);
    });
  }

  // TODO: incase we want infinity scrolling for preps list
  // @HostListener("window:scroll", [])
  // onScroll(): void {
  //   if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
  //     // Load Your Data Here
  //     log.debug("Load more Preps");
  //     const currentPrepListLength = this.persistenceService.prepList?.preps.length ?? 1;
  //     this.loadPrepList(currentPrepListLength, currentPrepListLength + 21);
  //   }
  // }

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

  initStakeSlider(): void {
    const max = (this.userOmmTokenBalanceDetails?.stakedBalance ?? 0) +
      (this.persistenceService.userOmmTokenBalanceDetails?.availableBalance ?? 0);

    // Stake slider
    noUiSlider.create(this.sliderStake, {
      start: [0],
      padding: [0],
      connect: 'lower',
      range: {
        min: [0],
        max: [max === 0 ? 150 : max]
      },
    });

    // slider slider value if user Omm token balances are already loaded
    if (this.userOmmTokenBalanceDetails) {
      this.sliderStake.noUiSlider.set(this.userOmmTokenBalanceDetails.stakedBalance);
    }

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];

      this.userOmmTokenBalanceDetails!.stakedBalance = value;

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
    $("#vote-overview").addClass('adjust');

    // Set your P-Rep sliders to initial values
    $('#slider-stake').removeAttr("disabled");
  }

  // On "Cancel Stake" click
  onStakeAdjustCancelClick(): void {
    // Remove "adjust" class
    $("#vote-overview").removeClass('adjust');

    // Set your stake slider to the initial value
    this.sliderStake.setAttribute("disabled", "");
    this.sliderStake.noUiSlider.set(this.persistenceService.userOmmTokenBalanceDetails?.stakedBalance ?? 0);
  }

  // On "Adjust votes" click
  onAdjustVoteClick(): void {
    this.yourVotesEditMode = true;

    // Add "adjust" class
    $("#your-votes").addClass('adjust');
  }

  // On "Cancel adjust votes" click
  onCancelAdjustVotesClick(): void {
    this.yourVotesEditMode = false;

    // reset the your prep votes list
    this.resetYourVotePreps();

    // Remove "adjust" class
    $("#your-votes").removeClass('adjust');
  }

  onConfirmStakeClick(): void {
    log.debug(`onConfirmStakeClick Omm stake amount = ${this.userOmmTokenBalanceDetails?.stakedBalance}`);
    const before = this.persistenceService.userOmmTokenBalanceDetails?.stakedBalance ?? 0;
    const after = this.userOmmTokenBalanceDetails?.stakedBalance ?? 0;

    // if before and after equal show notification
    if (before === after) {
      this.notificationService.showNewNotification("No change in staked value.");
      return;
    }

    const diff = after - before;

    const voteAction = new VoteAction(before, after, diff);

    if (diff > 0) {
      this.modalService.showNewModal(ModalType.STAKE_OMM_TOKENS, undefined, voteAction);
    } else {
      this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS, undefined, voteAction);
    }
  }

  onConfirmUnstakeClick(): void {
    this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS);
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
    // TODO: change when not testing
    return true;
    // const userOmmTokenBalance = this.persistenceService.userOmmTokenBalanceDetails?.totalBalance ?? 0;
    // return userOmmTokenBalance > 0;
  }

  userHasStaked(): boolean {
    // TODO: change when not testing
    return true;
    // const stakedBalance = this.persistenceService.userOmmTokenBalanceDetails?.stakedBalance ?? 0;
    // return stakedBalance > 0;
  }

  userVotingPower(): number {
    const userStakedBalance = this.userOmmTokenBalanceDetails?.stakedBalance ?? 0;
    return this.calculationsService.yourVotingPower(userStakedBalance);

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
}
