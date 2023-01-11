import {Component, OnDestroy, OnInit} from '@angular/core';
import {StateChangeService} from "../../services/state-change/state-change.service";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {

  userHasNotVoted = false;
  activeProposalExist = false;
  userLoggedIn = false;

  afterUserDataReloadSub?: Subscription;
  afterCoreDataReloadSub?: Subscription;
  userLoginSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private persistenceService: PersistenceService,
              private reloaderService: ReloaderService) {
  }

  ngOnInit(): void {
    this.userHasNotVoted = false;
    this.activeProposalExist = false;
    this.setActiveVoteStatus();

    this.afterUserDataReloadSub = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.setActiveVoteStatus();
    });

    this.afterCoreDataReloadSub = this.stateChangeService.afterCoreDataReload$.subscribe(() => {
      this.setActiveVoteStatus();
    });

    this.userLoginSub = this.stateChangeService.loginChange$.subscribe(wallet => {
      this.userLoggedIn = wallet !== undefined;
    })
  }

  ngOnDestroy(): void {
    this.afterCoreDataReloadSub?.unsubscribe();
    this.afterUserDataReloadSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
  }

  setActiveVoteStatus(): void {
      for (const proposal of this.persistenceService.proposalList) {
        if (this.persistenceService.userLoggedIn()) {
          if (!proposal.proposalIsOver(this.reloaderService)) {
            const userVote = this.persistenceService.userProposalVotes.get(proposal.id);

            // if no vote exists or user vote for and against is zero
            if (!userVote || (userVote.for.lte(0) && userVote.against.lte(0))) {
              this.userHasNotVoted = true;
              return;
            }
          }
        } else {
          if (!this.persistenceService.userLoggedIn() && !proposal.proposalIsOver(this.reloaderService)) {
            this.activeProposalExist = true;
          }
        }
    }
  }

  userHasNotVotedClass(): string {
    return this.userHasNotVoted || (!this.userLoggedIn && this.activeProposalExist) ? "vote-dot" : "";
  }

}
