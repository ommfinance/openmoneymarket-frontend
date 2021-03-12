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

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private stateChangeService: StateChangeService,
              private voteService: VoteService,
              public calculationsService: CalculationsService) {
    super(persistenceService);
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails;

    this.yourVotesPrepList.push(
      new YourPrepVote("", "Icon Foundation",  65),
      new YourPrepVote("", "ICX_Station",  65),
      new YourPrepVote("", "VELIC",  65),
      );

    this.loadPrepList();
  }

  ngOnInit(): void {
    this.subscribeToLoginChange();
    this.subscribeToOmmTokenBalanceChange();
  }

  ngAfterViewInit(): void {
    this.userOmmTokenBalanceDetails = this.persistenceService.userOmmTokenBalanceDetails;
    this.initStakeSlider();
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

    const max = this.persistenceService.userOmmTokenBalanceDetails?.availableBalance ?? 0;
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

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];
      this.ommStakeAmount = value;

      // Update OMM stake values
      $(this.ommStakeAmount).text(normalFormat.to(value));
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
    this.sliderStake.noUiSlider.set(0);
  }

  // On "Adjust votes" click
  onAdjustVoteClick(): void {
    // Add "adjust" class
    $("#your-votes").addClass('adjust');
    $(".list.p-reps").addClass('adjust');
  }

  // On "Discard adjust votes" click
  onDiscardAdjustVotesClick(): void {
    // Remove "adjust" class
    $("#your-votes").removeClass('adjust');
    $(".list.p-reps").removeClass('adjust');
  }

  onConfirmStakeClick(): void {
    log.debug(`onConfirmStakeClick Omm stake amount = ${this.ommStakeAmount}`);

    this.modalService.showNewModal(ModalType.STAKE_OMM_TOKENS);
  }

  onConfirmUnstakeClick(): void {
    this.modalService.showNewModal(ModalType.UNSTAKE_OMM_TOKENS);
  }

  onConfirmAddPrepClick(): void {
    this.modalService.showNewModal(ModalType.ADD_PREP_SELECTION);
  }

  onConfirmRemovePrepClick(): void {
    this.modalService.showNewModal(ModalType.REMOVE_PREP_SELECTION);
  }

  private loadPrepList(): void {
    this.voteService.getListOfPreps().then(prepList => {
      this.prepList = prepList;
      this.searchedPrepList = prepList;
    }).catch(e => {
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

}
