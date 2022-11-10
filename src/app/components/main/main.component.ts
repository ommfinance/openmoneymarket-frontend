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
    this.userHasNotVoted = false;

    this.stateChangeService.userProposalVotesChange$.subscribe(() => {
      this.setUserHasNotVoted();
    });
    this.stateChangeService.proposalListChange.subscribe(() => {
      this.setUserHasNotVoted();
    });

    this.setUserHasNotVoted();
  }

  setUserHasNotVoted(): void {
    for (const proposal of this.persistenceService.proposalList) {
      const userVote = this.persistenceService.userProposalVotes.get(proposal.id);

      if (userVote) {
        this.userHasNotVoted = !(userVote.for.gt(0) || userVote.against.gt(0));
      }
    }
  }

  userHasNotVotedClass(): string {
    return this.userHasNotVoted ? "vote-dot" : "";
  }

}
