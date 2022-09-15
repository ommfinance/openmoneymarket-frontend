import {Component, OnInit} from '@angular/core';
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ReloaderService} from "../../services/reloader/reloader.service";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  userHasNotVoted = false;

  constructor(private stateChangeService: StateChangeService,
              private persistenceService: PersistenceService,
              private reloaderService: ReloaderService) {
  }

  ngOnInit(): void {
    this.stateChangeService.userProposalVotesChange$.subscribe(() => {
      this.setUserHasNotVoted();
    });
    this.stateChangeService.proposalListChange.subscribe(() => {
      this.setUserHasNotVoted();
    });
  }

  setUserHasNotVoted(): void {
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
