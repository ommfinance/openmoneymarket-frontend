import { Injectable } from '@angular/core';
import {Proposal} from "../../models/Proposal";

@Injectable({
  providedIn: 'root'
})
export class ProposalService {

  public selectedProposal?: Proposal;

  constructor() { }

}
