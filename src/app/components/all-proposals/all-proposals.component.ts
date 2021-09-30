import {Component, OnInit} from '@angular/core';
import {Proposal} from "../../models/Proposal";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ProposalService} from "../../services/proposal/proposal.service";
import {BaseClass} from "../base-class";
import {ReloaderService} from "../../services/reloader/reloader.service";

@Component({
  selector: 'app-all-proposals',
  templateUrl: './all-proposals.component.html'
})
export class AllProposalsComponent extends BaseClass implements OnInit {

  constructor(public persistenceService: PersistenceService,
              private proposalService: ProposalService,
              public reloaderService: ReloaderService) {
    super(persistenceService);
  }

  ngOnInit(): void {
  }

  getProposalList(): Proposal[] {
    return this.persistenceService.proposalList;
  }

  onProposalClick(proposal: Proposal): void {
    this.proposalService.selectedProposal = proposal;
  }

}
