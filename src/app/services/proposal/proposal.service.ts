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
              private localstorageService: LocalStorageService) { }

  getSelectedProposal(): Proposal | undefined {
    return this.selectedProposal;
}

  setSelectedProposal(proposal: Proposal): void {
    this.selectedProposal = proposal;
    this.localstorageService.persistActiveProposal(proposal);
    this.stateChangeService.selectedProposalUpdate(proposal);
  }

}
