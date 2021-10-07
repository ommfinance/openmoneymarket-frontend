import { Component, OnInit } from '@angular/core';
import {PersistenceService} from "../../services/persistence/persistence.service";
import BigNumber from "bignumber.js";
import {TransactionDispatcherService} from "../../services/transaction-dispatcher/transaction-dispatcher.service";
import {ScoreService} from "../../services/score/score.service";
import {ModalService} from "../../services/modal/modal.service";
import {GovernanceAction} from "../../models/GovernanceAction";
import {ModalType} from "../../models/ModalType";
import {CreateProposal, Proposal} from "../../models/Proposal";
import {NotificationService} from "../../services/notification/notification.service";
import {Utils} from "../../common/utils";
import {ommForumDomain} from "../../common/constants";

@Component({
  selector: 'app-new-proposal',
  templateUrl: './new-proposal.component.html'
})
export class NewProposalComponent implements OnInit {

  titleSize = 0;
  descriptionSize = 0;
  forumLinkSize = 0;

  title = "";
  description = "";
  forumLink = "";

  constructor(public persistenceService: PersistenceService,
              private txDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
              private modalService: ModalService,
              private notificationService: NotificationService) { }

  ngOnInit(): void {
  }

  onForumLinkChange(e: any): void {
    this.forumLink = e.target.value;
    this.forumLinkSize = this.forumLink.length;
  }

  onTitleChange(e: any): void {
    this.title = e.target.value;
    this.titleSize = this.title.length;
  }

  onDescriptionChange(e: any): void {
    this.description = e.target.value;
    this.descriptionSize = this.description.length;
  }

  voteDefinitionFee(): BigNumber {
    return this.persistenceService.voteDefinitionFee;
  }

  fieldsValid(): boolean {
    if (!this.title) {
      return false;
    } else if (!this.description) {
      return false;
    } else if (!this.forumLink) {
      return false;
    } else if (!Utils.textContainsDomain(ommForumDomain, this.forumLink)) {
      return false;
    }

    return true;
  }

  userHasEnoughOmmStaked(): boolean {
    return this.persistenceService.getUsersStakedOmmBalance().gte(this.persistenceService.getMinOmmStakedRequiredForProposal());
  }

  onSubmitClick(): void {
    if (!(this.fieldsValid() && this.userHasEnoughOmmStaked())) {
      return;
    }

    else if (!this.title) {
      this.notificationService.showNewNotification("Title must not be empty.");
      return;
    } else if (!this.description) {
      this.notificationService.showNewNotification("Description must not be empty.");
      return;
    } else if (!this.forumLink) {
      this.notificationService.showNewNotification("Forum link must not be empty.");
      return;
    } else if (!Utils.textContainsDomain(ommForumDomain, this.forumLink)) {
      this.notificationService.showNewNotification(`Must link to a discussion on ${ommForumDomain}.`);
      return;
    } else if (!this.userHasEnoughOmmStaked()) {
      this.notificationService.showNewNotification(`Stake at least ${this.persistenceService.getMinOmmStakedRequiredForProposal()
      } OMM if you want to propose a change.`);
      return;
    }

    // TODO save forum link to the omm.api
    const proposal = new CreateProposal(
      this.title,
      this.description.replace(/(\r\n|\n|\r)/gm, " "),
      new BigNumber("0"),
      new BigNumber("0"),
      this.voteDefinitionFee(),
      this.forumLink
    );

    const governanceAction = new GovernanceAction(proposal, false);
    this.modalService.showNewModal(ModalType.SUBMIT_PROPOSAL, undefined, undefined, undefined, governanceAction);
  }
}
