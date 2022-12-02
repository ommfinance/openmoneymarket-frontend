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
  NEW_PROPOSAL_EMPTY_LINK,
  NEW_PROPOSAL_EMPTY_METHOD,
  NEW_PROPOSAL_EMPTY_TITLE,
  NEW_PROPOSAL_INVALID_LINK_DOMAIN,
  NEW_PROPOSAL_INVALID_PARAMETER,
  NEW_PROPOSAL_MIN_BOMM_REQUIRED,
  NEW_PROPOSAL_MISSING_PARAMETERS,
} from "../../common/messages";
import {ProposalType} from "../../models/enums/ProposalType";
import {ScoreService} from "../../services/score/score.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {Subscription} from "rxjs";
import {IconApiService} from "../../services/icon-api/icon-api.service";
import {IScoreParameter, IScorePayloadParameter, scoreParamToPayloadParam} from "../../models/Interfaces/IScoreParameter";
import {BaseClass} from "../base-class";
import {IParamInput} from "../../models/Interfaces/IParamInput";
import {ScoreParamType} from "../../models/enums/ScoreParamType";

@Component({
  selector: 'app-new-proposal',
  templateUrl: './new-proposal.component.html',
})
export class NewProposalComponent extends BaseClass implements OnInit, OnDestroy {

  selPropTypeEl: any;
  @ViewChild("selPropType")set a(a: ElementRef) {this.selPropTypeEl = a.nativeElement; }

  MAX_PROPOSAL_DESCRIPTION_LENGTH = MAX_PROPOSAL_DESCRIPTION_LENGTH;

  titleSize = 0;
  descriptionSize = 0;
  forumLinkSize = 0;

  title = "";
  description = "";
  forumLink = "";
  proposalType = ProposalType.TEXT;

  ProposalType = ProposalType;

  selectedContract?: string;
  selectedMethod?: string;
  selectedContractMethods: string[] = [];
  contractOptions: string[] = [];
  contractMethodsMap = new Map<string, string[]>();
  contractNameMap = new Map<string, string>();
  methodParamsMap = new Map<string, IScoreParameter[]>();
  parametersMap = new Map<string, IParamInput>(); // param name -> param
  transactions?: any;

  allAddressesLoaded = false;
  allAddressesLoadedSub?: Subscription;

  constructor(public persistenceService: PersistenceService,
              private modalService: ModalService,
              private notificationService: NotificationService,
              public scoreService: ScoreService,
              private stateChangeService: StateChangeService,
              private iconApi: IconApiService) {
    super(persistenceService);
  }

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
    this.parametersMap = new Map<string, IParamInput>();
    this.forumLink = "";
    this.proposalType = ProposalType.TEXT;
    this.contractOptions = [];
    this.selectedContract = "";
    this.selectedContractMethods = [];
    this.contractMethodsMap = new Map<string, string[]>();
    this.contractNameMap = new Map<string, string>();
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
        this.contractNameMap = new Map<string, string>();

        // get contracts names
        Promise.all(contracts.map(async (contract) => {
          const name = await this.scoreService.getContractName(contract);
          this.contractNameMap.set(contract, name);
        }));

        // get contracts methods
        Promise.all(contracts.map(async (address) => {
          this.contractMethodsMap = new Map<string, string[]>();
          const methods = await this.scoreService.getGovernanceSupportedContractMethods(address);
          this.contractMethodsMap.set(address, methods);

          Promise.all(methods.map(async (method) => {
            const scoreApi = await this.iconApi.getScoreApi(address);
            console.log(`Score api of ${method}:`, scoreApi.getMethod(method).inputs)
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

    // reset parameters map
    this.parametersMap = new Map<string, IParamInput>();

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

  getMethodParams(): IScoreParameter[] {
    return this.methodParamsMap.get(this.selectedMethod || "") ?? [];
  }

  paramIsRequired(param: IScoreParameter): boolean {
    // parameter is required if object has no 'default' key
    return !("default" in param);
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

  onParametersChange(e: any, param: IScoreParameter): void {
    this.delay(() => {
      const value = e.target.value.toString();

      if (!value) return;

      if (param.type === ScoreParamType.INT) {
        if (Utils.isPositiveNumeric(value)) {
          this.parametersMap.set(param.name, { param, value });
        } else {
          this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETER(param.type))
        }
      } else if (param.type === ScoreParamType.ADDRESS) {
        if (Utils.isAddress(value)) {
          this.parametersMap.set(param.name, { param, value });
        } else {
          this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETER(param.type))
        }
      } else {
        this.parametersMap.set(param.name, { param, value });
      }
    }, 1000 );
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
    } else if (this.proposalType === ProposalType.CONTRACT && (!this.selectedContract || !this.selectedMethod)) {
      return false
    } else if (this.proposalType === ProposalType.CONTRACT && !this.allMethodParamsAreInParamsMap()) {
      return false;
    }

    return true;
  }

  userHasEnoughBOmm(): boolean {
    return this.persistenceService.userbOmmBalance.gte(this.persistenceService.getMinBOmmRequiredForProposal());
  }

  constructParameters(): IScorePayloadParameter[] {
    console.log("constructParameters methodParamsMap:", this.methodParamsMap);
    const parameters: IScorePayloadParameter[] = [];
    this.methodParamsMap.get(this.selectedMethod ?? "")?.forEach(param => {
      const paramInput = this.parametersMap.get(param.name);
      console.log("paramInput = ", paramInput);

      if (paramInput == undefined && this.paramIsRequired(param)) throw new Error(`Parameter ${param.name} does not exist in parametersMap!`);

      if (paramInput && paramInput.value.trim() != "") {
        parameters.push({
          type: scoreParamToPayloadParam(param.type),
          value: paramInput.value
        })
      }
    })

    return parameters;
  }

  constructTransactionsJson(): any[] {
    return [
      {
        address: this.selectedContract,
        method: this.selectedMethod,
        parameters: this.constructParameters()
      }
    ];
  }

  allMethodParamsAreInParamsMap(): boolean {
    const methodParams = this.methodParamsMap.get(this.selectedMethod ?? "");
    return methodParams ? methodParams.every(param => this.paramIsRequired(param) ? this.parametersMap.get(param.name) != undefined : true) : false;
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
      if (!this.selectedMethod) {
        this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_METHOD);
      }
      if (!this.allMethodParamsAreInParamsMap()) {
        this.notificationService.showNewNotification(NEW_PROPOSAL_MISSING_PARAMETERS);
      }
    }

    if (!(this.fieldsValid() && this.userHasEnoughBOmm())) {
      return;
    }

    if (this.proposalType === ProposalType.CONTRACT) {
      this.transactions = this.constructTransactionsJson();
    } else {
      this.transactions = undefined;
    }


    // TODO save forum link to the omm.api
    const proposal = new CreateProposal(
      this.title,
      encodeURI(this.description),
      new BigNumber("0"),
      new BigNumber("0"),
      this.voteDefinitionFee(),
      encodeURI(this.forumLink),
      this.transactions != undefined ? JSON.stringify(this.transactions) : undefined
    );

    const governanceAction = new GovernanceAction(proposal, false);
    this.modalService.showNewModal(ModalType.SUBMIT_PROPOSAL, undefined, undefined, undefined, governanceAction);
  }
}
