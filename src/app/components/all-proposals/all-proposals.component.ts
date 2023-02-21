import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from '@angular/core';
import {Proposal} from "../../models/classes/Proposal";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {BaseClass} from "../base-class";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {Router} from "@angular/router";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-all-proposals',
  templateUrl: './all-proposals.component.html',
})
export class AllProposalsComponent extends BaseClass implements OnInit, OnDestroy {

  proposalList: Proposal[] = []

  coreDataReloadSub?: Subscription;

  constructor(public persistenceService: PersistenceService,
              public reloaderService: ReloaderService,
              private router: Router,
              private stateChangeService: StateChangeService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initCoreData();

    this.subscribeToCoreDataReload();
  }

  ngOnDestroy(): void {
    this.coreDataReloadSub?.unsubscribe();
  }

  subscribeToCoreDataReload(): void {
    this.coreDataReloadSub = this.stateChangeService.afterCoreDataReload$.subscribe(() => this.initCoreData())
  }

  initCoreData(): void {
    this.proposalList = this.persistenceService.proposalList;
  }

  onProposalClick(proposal: Proposal): void {
    this.router.navigate(["vote/proposal", proposal.id.toString()]);
  }

}
