import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Proposal} from "../../models/classes/Proposal";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {BaseClass} from "../base-class";
import {ModalService} from "../../services/modal/modal.service";
import {ModalType} from "../../models/enums/ModalType";
import {GovernanceAction} from "../../models/classes/GovernanceAction";
import {ReloaderService} from "../../services/reloader/reloader.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Vote} from "../../models/classes/Vote";
import {ScoreService} from "../../services/score/score.service";
import log from "loglevel";
import {ModalStatus} from "../../models/classes/ModalAction";
import BigNumber from "bignumber.js";
import {ActivatedRoute} from "@angular/router";
import {Utils} from "../../common/utils";
import {IScoreParameter, IScoreParameterValue, scorePayloadParameterToString} from "../../models/Interfaces/IScoreParameter";
import {Subscription} from "rxjs";
import {IconApiService} from "../../services/icon-api/icon-api.service";
import {IProposalScoreDetails} from "../../models/Interfaces/IProposalScoreDetails";
import {IProposalTransactions} from "../../models/Interfaces/IProposalTransactions";

@Component({
  selector: 'app-proposal',
  templateUrl: './proposal.component.html'
})
export class ProposalComponent extends BaseClass implements OnInit, AfterViewInit, OnDestroy {

  activeProposal?: Proposal;
  userVote?: Vote;
  proposalId?: BigNumber;
  proposalScoreDetails?: IProposalScoreDetails[];

  currentTimestampMicro = Utils.timestampNowMicroseconds();

  allAddressesLoaded = false;
  allAddressesLoadedSub?: Subscription;
  pathParamSub?: Subscription;
  loginSub?: Subscription;
  userVoteChangeSub?: Subscription;
  proposalListSub?: Subscription;
  modalActionSub?: Subscription;

  constructor(private modalService: ModalService,
              public persistenceService: PersistenceService,
              public reloaderService: ReloaderService,
              private stateChangeService: StateChangeService,
              private scoreService: ScoreService,
              private cdRef: ChangeDetectorRef,
              private route: ActivatedRoute,
              private iconApi: IconApiService) {
      super(persistenceService);
  }

  ngOnInit(): void {
    this.loadAsyncData();

    this.subscribeToAllAddressesLoaded();

    this.subscribeToPathParamsChange();
    this.subscribeToModalActionResult();
    this.subscribeToUserProposalVoteChange();
    this.subscribeToProposalListChange();
    this.subscribeToLoginChange();
  }

  ngOnDestroy(): void {
    this.allAddressesLoadedSub?.unsubscribe();
    this.pathParamSub?.unsubscribe();
    this.loginSub?.unsubscribe();
    this.userVoteChangeSub?.unsubscribe();
    this.proposalListSub?.unsubscribe();
    this.modalActionSub?.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.userLoggedIn() && this.activeProposal && !this.userVote) {
      this.scoreService.getVotesOfUsers(this.activeProposal.id).then(vote => this.userVote = vote).catch(e => log.error(e));
    }
  }

  subscribeToAllAddressesLoaded(): void {
    this.allAddressesLoadedSub = this.stateChangeService.allAddressesLoaded$.subscribe(() => {
      this.allAddressesLoaded = true;
      this.loadAsyncData();
    })
  }

  loadAsyncData(): void {
    if (this.allAddressesLoaded || this.persistenceService.allAddresses) {
      this.loadAsyncContractOptions();
    }
  }

  async loadAsyncContractOptions(): Promise<void> {
    if (this.activeProposal && this.activeProposal?.transactions && this.activeProposal.transactions.length > 0) {
      this.proposalScoreDetails = [];

      // fetch transactions contract name, methods and api
      Promise.all(this.activeProposal.transactions.map(async (transaction) => {
        const name = await this.scoreService.getContractName(transaction.address);
        const method = transaction.method;
        const scoreApi = await this.iconApi.getScoreApi(transaction.address);
        const methodParams: IScoreParameter[] = scoreApi.getMethod(method).inputs;
        const parameters: IScoreParameterValue[] = new Array<IScoreParameterValue>();
        // combine method params and value in single object
        transaction.parameters.forEach((param, index) => parameters.push({ value: param.value, ...methodParams[index] }));

        this.proposalScoreDetails!.push({
          address: transaction.address,
          name,
          method,
          parameters
        });
      }));
    }
  }

  subscribeToPathParamsChange(): void {
    // handle when user comes directly to the link with id
    this.pathParamSub = this.route.paramMap.subscribe(paramMap => {
      log.debug("subscribeToPathParamsChange...");
      const proposalId = new BigNumber(paramMap.get('id') ?? 0);

      if (proposalId.isFinite() && proposalId.gt(0) && !proposalId.isEqualTo(this.activeProposal?.id ?? 0)) {
        log.debug("pathParams... handling proposal " + proposalId.toString());
        const proposal = this.persistenceService.getProposal(proposalId);
        if (proposal) {
          this.handleProposal(proposal);
        } else {
          this.proposalId = proposalId;
        }
      }
    });
  }

  subscribeToLoginChange(): void {
    this.loginSub = this.stateChangeService.loginChange$.subscribe((wallet) => {
      // logout
      if (!wallet) {
        this.userVote = undefined;
      }
    });
  }

  subscribeToProposalListChange(): void {
    this.proposalListSub = this.stateChangeService.proposalListChange.subscribe((proposalList) => {
      log.debug("proposalListChange..", proposalList);
      log.debug("proposalId = " + this.proposalId?.toString());
      for (const proposal of proposalList) {
        if (proposal.id.isEqualTo(this.proposalId ?? -1)) {
          this.handleProposal(proposal);
          break;
        }
      }

      this.cdRef.detectChanges();
    });
  }

  subscribeToUserProposalVoteChange(): void {
    this.userVoteChangeSub = this.stateChangeService.userProposalVotesChange$.subscribe((change) => {
      if (this.userLoggedIn() && this.activeProposal?.id === change.proposalId) {
        this.userVote = this.persistenceService.userProposalVotes.get(this.activeProposal.id);
      }
    });
  }

  private subscribeToModalActionResult(): void {
    this.modalActionSub = this.stateChangeService.userModalActionResult.subscribe(res => {
      if (res.modalAction.modalType === ModalType.CAST_VOTE && res.modalAction.governanceAction?.proposalId?.isEqualTo(
        this.activeProposal?.id ?? -1)) {
        if (res.status === ModalStatus.CANCELLED) {
          log.debug("proposal ModalStatus.CANCELLED");
          log.debug(`this.activeProposal?.id = ${this.activeProposal?.id.toNumber()}`);
          log.debug(`this.userVote = ${this.persistenceService.userProposalVotes.get(this.activeProposal?.id ?? new BigNumber("-1"))}`);
          this.userVote = this.persistenceService.userProposalVotes.get(this.activeProposal?.id ?? new BigNumber("-1"));
        }
      }
    });
  }

  handleProposal(proposal?: Proposal): void {
    if (!proposal) {
      return log.debug("handleProposal.. proposal is undefined..");
    }

    log.debug("handleProposal:", proposal);
    this.activeProposal = proposal;
    this.proposalId = this.activeProposal.id;
    this.loadAsyncData();

    if (this.userLoggedIn()) {
      log.debug("handleProposal... Setting userVote:", this.persistenceService.userProposalVotes.get(this.activeProposal.id));
      this.userVote = this.persistenceService.userProposalVotes.get(this.activeProposal.id);
    }
  }

  getUsersVotingWeightOnProposal(): BigNumber {
    if (this.userVote) {
      if (this.userVote.against.isFinite() && !this.userVote.against.isZero()) {
        return this.userVote.against;
      } else {
        return this.userVote.for;
      }
    } else {
      return new BigNumber("0");
    }
  }

  isProposalContractType(): boolean {
    return this.activeProposal?.transactions !== undefined && this.activeProposal?.transactions.length > 0;
  }

  constructScoreDetailsKey(transaction: IProposalTransactions): string {
    return transaction.address + transaction.method + scorePayloadParameterToString(transaction.parameters);
  }

  isVoteValid(): boolean {
    if (this.userVote) {
      return (this.userVote.against.isFinite() && !this.userVote.against.isZero()) ||
        (this.userVote.for.isFinite() && !this.userVote.for.isZero());
    } else {
      return false;
    }
  }

  isVoteRejected(): boolean {
    if (this.userVote) {
      return this.userVote.against.isGreaterThan(this.userVote.for);
    }
    return false;
  }

  isVoteApproved(): boolean {
    if (this.userVote) {
      return this.userVote.for.isGreaterThan(this.userVote.against);
    }
    return false;
  }

  totalVoters(): number {
    const proposal = this.activeProposal;
    return (proposal?.forVoterCount.toNumber() ?? 0) + (proposal?.againstVoterCount.toNumber() ?? 0);
  }

  onRejectClick(): void {
    const governanceAction = new GovernanceAction(undefined, false, this.activeProposal?.id);
    this.modalService.showNewModal(ModalType.CAST_VOTE, undefined, undefined, undefined, governanceAction);
  }

  onApproveClick(): void {
    const governanceAction = new GovernanceAction(undefined, true, this.activeProposal?.id);
    this.modalService.showNewModal(ModalType.CAST_VOTE, undefined, undefined, undefined, governanceAction);
  }

  onChangeVoteClick(): void {
    if (this.isVoteApproved()) {
      this.onRejectClick();
    } else if (this.isVoteRejected()) {
      this.onApproveClick();
    }
  }

}
