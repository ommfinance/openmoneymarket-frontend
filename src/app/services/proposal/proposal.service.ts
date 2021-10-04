import { Injectable } from '@angular/core';
import {Proposal} from "../../models/Proposal";
import {StateChangeService} from "../state-change/state-change.service";
import {LocalStorageService} from "../local-storage/local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class ProposalService {

  private selectedProposal?: Proposal;

  constructor(private stateChangeService: StateChangeService,
              private localstorageService: LocalStorageService) {
    this.stateChangeService.loginChange.subscribe(wallet => {
      this.stateChangeService.selectedProposalUpdate(this.getSelectedProposal());
    });
  }

  getSelectedProposal(): Proposal | undefined {
    return this.selectedProposal ? this.selectedProposal : this.localstorageService.getActiveProposal();
}

  setSelectedProposal(proposal: Proposal): void {
    this.selectedProposal = proposal;
    this.localstorageService.persistActiveProposal(proposal);
    this.stateChangeService.selectedProposalUpdate(proposal);
  }

}
