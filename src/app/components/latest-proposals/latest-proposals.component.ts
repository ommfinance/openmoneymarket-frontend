import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {Proposal} from "../../models/classes/Proposal";
import {Router} from "@angular/router";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Utils} from "../../common/utils";
import {ReloaderService} from "../../services/reloader/reloader.service";

@Component({
  selector: 'app-latest-proposals',
  templateUrl: './latest-proposals.component.html'
})
export class LatestProposalsComponent extends BaseClass implements OnInit {

  @Input() latestProposals!: Proposal[];

  currentTimestampMicro = Utils.timestampNowMicroseconds();

  constructor(public persistenceService: PersistenceService,
              private router: Router,
              private stateChangeService: StateChangeService,
              private cd: ChangeDetectorRef,
              public reloaderService: ReloaderService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.subscribeToCurrenTimestampChange();
  }

  subscribeToCurrenTimestampChange(): void {
    this.stateChangeService.currentTimestampChange$.subscribe(res => {
      this.currentTimestampMicro = res.currentTimestampMicro;
      this.cd.detectChanges();
    });
  }

  onProposalClick(proposal: Proposal): void {
    this.router.navigate(["vote/proposal", proposal.id.toString()]);
  }

}
