import {Component, OnInit} from '@angular/core';
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  userHasNotVoted = false;

  constructor(private stateChangeService: StateChangeService,
              private persistenceService: PersistenceService) {
  }

  ngOnInit(): void {
    this.stateChangeService.userProposalVotesChange$.subscribe(() => {
      this.setUserHasVoted();
    });
    this.stateChangeService.proposalListChange.subscribe(() => {
      this.setUserHasVoted();
    });
  }

  setUserHasVoted(): void {
      for (const proposal of this.persistenceService.proposalList) {
        const userVote = this.persistenceService.userProposalVotes.get(proposal.id);
        if (userVote && (userVote.for.gt(0) || userVote.against.gt(0))) {
          this.userHasNotVoted = true;
        }
      }
  }

  userHasNotVotedClass(): string {
    return this.userHasNotVoted ? "vote-dot" : "";
  }

}
