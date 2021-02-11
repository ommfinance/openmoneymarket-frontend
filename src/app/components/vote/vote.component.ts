import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Earnings, Prep, Votes} from "../../models/Prep";
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {normalFormat} from "../../common/formats";
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";

declare var noUiSlider: any;
declare var wNumb: any;
declare var $: any;

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VoteComponent extends BaseClass implements OnInit, AfterViewInit {

  preps: Prep[] = [];

  searchInput = "";

  @ViewChild("sliderStake")set sliderStakeSetter(sliderStake: ElementRef) {this.sliderStake = sliderStake.nativeElement; }
  private sliderStake?: any;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService) {
    super(persistenceService);

    // mock list TODO use real
    for (let i = 0; i < 22; i++) {
      this.preps.push(new Prep("ICX_Station", new Earnings(19145, 47555), new Votes(5.77, 19132308)));
    }
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.initStakeSlider();
  }

  onSearchInputChange(): void {
    // TODO
  }

  initStakeSlider(): void {
    // Stake slider
    noUiSlider.create(this.sliderStake, {
      start: [0],
      padding: [0],
      connect: 'lower',
      range: {
        min: [0],
        max: [150]
      },
    });

    // On stake slider update
    this.sliderStake.noUiSlider.on('update', (values: any, handle: any) => {
      const value = +values[handle];

      // Update OMM stake values
      $('.value-omm-stake-amount').text(normalFormat.to(value));
      // Update OMM stake values as ICX
      $('.value-icx-stake-amount').text(normalFormat.to(value * 1.3));
    });
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
  }

  // On "Discard adjust votes" click
  onDiscardAdjustVotesClick(): void {
    // Remove "adjust" class
    $("#your-votes").removeClass('adjust');
  }

  onConfirmStakeClick(): void {
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

}
