import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PersistenceService} from "../../services/persistence/persistence.service";
import BigNumber from "bignumber.js";
import {ModalService} from "../../services/modal/modal.service";
import {GovernanceAction} from "../../models/classes/GovernanceAction";
import {ModalType} from "../../models/enums/ModalType";
import {CreateProposal} from "../../models/classes/Proposal";
import {NotificationService} from "../../services/notification/notification.service";
import {Utils} from "../../common/utils";
import {MAX_PROPOSAL_DESCRIPTION_LENGTH, ommForumDomain} from "../../common/constants";
import {
  NEW_PROPOSAL_EMPTY_CONTRACT,
  NEW_PROPOSAL_EMPTY_DESCRIPTION,
  NEW_PROPOSAL_EMPTY_LINK, NEW_PROPOSAL_EMPTY_METHOD,
  NEW_PROPOSAL_EMPTY_TITLE,
  NEW_PROPOSAL_INVALID_LINK_DOMAIN, NEW_PROPOSAL_INVALID_PARAMETERS,
  NEW_PROPOSAL_MIN_BOMM_REQUIRED, NEW_PROPOSAL_PARAMETERS
} from "../../common/messages";
import {ProposalType} from "../../models/enums/ProposalType";
import {ScoreService} from "../../services/score/score.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Subscription} from "rxjs";
import log from "loglevel";
import {IconApiService} from "../../services/icon-api/icon-api.service";
import {IScoreParameter} from "../../models/Interfaces/IScoreParameter";

@Component({
  selector: 'app-new-proposal',
  templateUrl: './new-proposal.component.html',
})
export class NewProposalComponent implements OnInit, OnDestroy {

  selPropTypeEl: any;
  @ViewChild("selPropType")set a(a: ElementRef) {this.selPropTypeEl = a.nativeElement; }

  MAX_PROPOSAL_DESCRIPTION_LENGTH = MAX_PROPOSAL_DESCRIPTION_LENGTH;

  titleSize = 0;
  descriptionSize = 0;
  forumLinkSize = 0;

  title = "";
  description = "";
  parametersText = "";
  parameters?: any;
  forumLink = "";
  proposalType = ProposalType.TEXT;

  ProposalType = ProposalType;

  selectedContract?: string;
  selectedMethod?: string;
  selectedContractMethods: string[] = [];
  contractOptions: string[] = [];
  contractMethodsMap = new Map<string, string[]>();
  methodParamsMap = new Map<string, IScoreParameter[]>();
  transactions?: any;

  allAddressesLoaded = false;
  allAddressesLoadedSub?: Subscription;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private notificationService: NotificationService,
              public scoreService: ScoreService,
              private stateChangeService: StateChangeService,
              private iconApi: IconApiService) { }

  ngOnInit(): void {
    this.initCoreValues();

    this.subscribeToAllAddressesLoaded();

    this.loadAsyncData();
  }

  ngOnDestroy(): void {
    this.allAddressesLoadedSub?.unsubscribe();
  }

  initCoreValues(): void {
    // init default values
    this.titleSize = 0;
    this.descriptionSize = 0;
    this.forumLinkSize = 0;

    this.title = "";
    this.description = "";
    this.parametersText = "";
    this.parameters = undefined;
    this.forumLink = "";
    this.proposalType = ProposalType.TEXT;
    this.contractOptions = [];
    this.selectedContract = "";
    this.selectedContractMethods = [];
    this.contractMethodsMap = new Map<string, string[]>();
    this.allAddressesLoaded = this.persistenceService.allAddresses !== undefined;
  }

  subscribeToAllAddressesLoaded(): void {
    this.allAddressesLoadedSub = this.stateChangeService.allAddressesLoaded$.subscribe(() => {
      this.allAddressesLoaded = true;
      this.loadAsyncData();
    })
  }

  loadAsyncData(): void {
    if (this.allAddressesLoaded) {
      this.loadAsyncContractOptions();
    }
  }

  loadAsyncContractOptions(): void {
    if (this.contractOptions.length === 0) {
      this.scoreService.getGovernanceSupportedContracts().then(contracts => {
        this.contractOptions = contracts;
        Promise.all(contracts.map(async (address) => {
          this.contractMethodsMap = new Map<string, string[]>();
          const methods = await this.scoreService.getGovernanceSupportedContractMethods(address);
          this.contractMethodsMap.set(address, methods);

          Promise.all(methods.map(async (method) => {
            const scoreApi = await this.iconApi.getScoreApi(address);
            this.methodParamsMap.set(method, scoreApi.getMethod(method).inputs)
          }));
        }));
      });
    }
  }

  onSelectContractChange(e: Event) {
    const value = (e.target as HTMLInputElement).value;

    if (!this.contractOptions.includes(value)) {
      this.selectedContract = undefined;
    } else {
      this.selectedContract = (e.target as HTMLInputElement).value;
      this.selectedContractMethods = this.contractMethodsMap.get(this.selectedContract ?? "") ?? [];
    }
  }

  onSelectContractMethodChange(e: Event) {
    if (!this.selectedContract) return;

    const value = (e.target as HTMLInputElement).value;

    if (!(this.contractMethodsMap.get(this.selectedContract) ?? []).includes(value)) {
      this.selectedMethod = undefined;
    } else {
      this.selectedMethod = value;
    }
  }

  onProposalTypeClick(): void {
    this.selPropTypeEl.classList.toggle("active");
  }

  getProposalTypeString(): string {
    return this.proposalType === ProposalType.CONTRACT ? "Contract" : "Text";
  }

  onSelectProposalTypeClick(e: MouseEvent, type: ProposalType): void {
    e.stopPropagation();
    this.proposalType = type;
    this.selPropTypeEl.classList.remove("active");
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
    this.descriptionSize = encodeURI(this.description).length;
  }

  onParametersChange(e: any): void {
    try {
      this.parametersText = e.target.value.toString();
      this.parameters = JSON.parse(e.target.value.toString()
        .replace(" ", "").replace(/\s/g, "").replace(/\n|\r/g, ""));
    } catch (e) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETERS)
    }
  }

  voteDefinitionFee(): BigNumber {
    return this.persistenceService.voteDefinitionFee;
  }

  fieldsValid(): boolean {
    if (!this.title) {
      return false;
    } else if (!this.description) {
      return false;
    } else if (this.descriptionSize > MAX_PROPOSAL_DESCRIPTION_LENGTH) {
      return false;
    } else if (!this.forumLink) {
      return false;
    } else if (!Utils.textContainsDomain(ommForumDomain, this.forumLink)) {
      return false;
    } else if (this.proposalType === ProposalType.CONTRACT && (!this.selectedContract || !this.selectedMethod || !this.parameters)) {
      return false
    }

    return true;
  }

  userHasEnoughBOmm(): boolean {
    return this.persistenceService.userbOmmBalance.gte(this.persistenceService.getMinBOmmRequiredForProposal());
  }

  constructTransactionsJson(): void {
    this.transactions = [
      {
        address: this.selectedContract,
        method: this.selectedMethod,
        parameters: this.parameters
      }
    ]
  }

  onSubmitClick(): void {
    if (!this.title) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_TITLE);
    }
    if (!this.description) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_DESCRIPTION);
    }
    if (!this.forumLink) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_LINK);
    }
    if (!Utils.textContainsDomain(ommForumDomain, this.forumLink)) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_LINK_DOMAIN);
    }
    if (!this.userHasEnoughBOmm()) {
      this.notificationService.showNewNotification(NEW_PROPOSAL_MIN_BOMM_REQUIRED(this.persistenceService.getMinBOmmRequiredForProposal()));
    }
    if (this.proposalType === ProposalType.CONTRACT) {
      if (!this.selectedContract) {
        this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_CONTRACT);
      }
      if (!this.parameters) {
        this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETERS);
      }
      if (!this.selectedMethod) {
        this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_METHOD);
      }
    }

    if (!(this.fieldsValid() && this.userHasEnoughBOmm())) {
      return;
    }

    this.constructTransactionsJson();

    log.debug("transactions input", this.transactions);
    log.debug("transactions json: ", JSON.stringify(this.transactions));
    log.debug("transactions json parsed: ", JSON.parse(JSON.stringify(this.transactions)));
    // if (JSON.parse(this.transactions)[0] && JSON.parse(this.transactions)[0].params) {
    //   log.debug("transactions json parsed params: ", JSON.parse(JSON.parse(this.transactions)[0].parameters));
    // }

    // TODO save forum link to the omm.api
    const proposal = new CreateProposal(
      this.title,
      encodeURI(this.description),
      new BigNumber("0"),
      new BigNumber("0"),
      this.voteDefinitionFee(),
      encodeURI(this.forumLink),
      this.transactions !== "" ? JSON.stringify(this.transactions) : "{}"
    );

    const governanceAction = new GovernanceAction(proposal, false);
    this.modalService.showNewModal(ModalType.SUBMIT_PROPOSAL, undefined, undefined, undefined, governanceAction);
  }
}
