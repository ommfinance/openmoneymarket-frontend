import { Component, OnInit } from '@angular/core';
import {Proposal} from "../../models/Proposal";
import {ProposalService} from "../../services/proposal/proposal.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {BaseClass} from "../base-class";
import {ModalService} from "../../services/modal/modal.service";
import {ModalType} from "../../models/ModalType";
import {GovernanceAction} from "../../models/GovernanceAction";
import {ReloaderService} from "../../services/reloader/reloader.service";

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html'
})
export class ProposalComponent extends BaseClass implements OnInit {

  constructor(private proposalService: ProposalService,
              private modalService: ModalService,
              public persistenceService: PersistenceService,
              public reloaderService: ReloaderService) {
      super(persistenceService);
  }

  ngOnInit(): void {
  }

  getProposal(): Proposal | undefined {
    return this.proposalService.selectedProposal;
  }

  totalVoters(): number {
    const proposal = this.getProposal();
    return (proposal?.forVoterCount.toNumber() ?? 0) + (proposal?.againstVoterCount.toNumber() ?? 0);
  }

  onRejectClick(): void {
    const governanceAction = new GovernanceAction(undefined, false, this.getProposal()?.id);
    this.modalService.showNewModal(ModalType.CAST_VOTE, undefined, undefined, undefined, governanceAction);
  }

  onApproveClick(): void {
    const governanceAction = new GovernanceAction(undefined, true, this.getProposal()?.id);
    this.modalService.showNewModal(ModalType.CAST_VOTE, undefined, undefined, undefined, governanceAction);
  }
}
