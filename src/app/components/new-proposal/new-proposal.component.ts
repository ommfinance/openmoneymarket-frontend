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
  getPlaceholderForParam,
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
import {NewProposalScoreData} from "../../models/classes/NewProposalScoreData";
import log from "loglevel";
import IconService from "icon-sdk-js";
import {fromUtf8} from "icon-sdk-js/build/data/Converter";
const { IconConverter } = IconService;

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
  supportedContractAddresses: string[] = [];
  contractMethodsMap = new Map<string, string[]>();
  contractNameMap = new Map<string, string>();
  methodParamsMap = new Map<string, IScoreParameter[]>();
  transactions?: any;

  newProposalScoreDataArray: NewProposalScoreData[] = [];

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
    this.forumLink = "";
    this.proposalType = ProposalType.TEXT;
    this.supportedContractAddresses = [];
    this.newProposalScoreDataArray = [new NewProposalScoreData()];
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
    if (this.supportedContractAddresses.length === 0) {
      this.scoreService.getGovernanceSupportedContracts().then(contracts => {
        this.supportedContractAddresses = contracts;
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
            this.methodParamsMap.set(method, scoreApi.getMethod(method).inputs)
          }));
        }));
      });
    }
  }

  onSelectContractChange(e: Event, scoreData: NewProposalScoreData) {
    const value = (e.target as HTMLInputElement).value;

    if (!this.supportedContractAddresses.includes(value)) {
      scoreData.selectedContract = undefined;
    } else {
      scoreData.selectedContract = (e.target as HTMLInputElement).value;
      scoreData.selectedContractMethods = this.getMethodsForContract(scoreData.selectedContract);
    }
  }

  getMethodsForContract(contract?: string): string[] {
    return this.contractMethodsMap.get(contract ?? "") ?? [];
  }

  onAddAnotherContractClick(e: MouseEvent): void {
    e.stopPropagation();

    this.newProposalScoreDataArray.push(new NewProposalScoreData());
  }

  onSelectContractMethodChange(e: Event, scoreData: NewProposalScoreData) {
    if (!scoreData.selectedContract) return;

    // reset parameters map
    scoreData.parametersMap = new Map<string, IParamInput>();

    const value = (e.target as HTMLInputElement).value;

    if (!(this.contractMethodsMap.get(scoreData.selectedContract) ?? []).includes(value)) {
      scoreData.selectedMethod = undefined;
    } else {
      scoreData.selectedMethod = value;
    }
  }

  onProposalTypeClick(): void {
    this.selPropTypeEl.classList.toggle("active");
  }

  getMethodParams(scoreData: NewProposalScoreData): IScoreParameter[] {
    return this.methodParamsMap.get(scoreData.selectedMethod || "") ?? [];
  }

  paramIsRequired(param: IScoreParameter): boolean {
    // parameter is required if object has no 'default' key
    return !("default" in param);
  }

  transferOmmSelected(scoreData: NewProposalScoreData): boolean {
    return scoreData.selectedMethod == "transferOmm";
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

  onParametersChange(e: any, param: IScoreParameter, scoreData: NewProposalScoreData): void {
    this.delay(() => {
      const value = Utils.isString(e) ? e : e.target.value.toString();

      if (!value) return;

      if (param.type === ScoreParamType.INT) {
        if (Utils.isPositiveNumeric(value)) {
          scoreData.parametersMap.set(param.name, { param, value });
        } else {
          this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETER(param.type))
        }
      } else if (param.type === ScoreParamType.ADDRESS) {
        if (Utils.isAddress(value)) {
          scoreData.parametersMap.set(param.name, { param, value });
        } else {
          this.notificationService.showNewNotification(NEW_PROPOSAL_INVALID_PARAMETER(param.type))
        }
      } else if (param.type === ScoreParamType.BYTES) {
        // IconConverter.fromUtf8('{ "method": "increaseAmount", "params": { "unlockTime": 0 }}')}
      scoreData.parametersMap.set(param.name, { param, value: IconConverter.fromUtf8(value) });
      } else {
        scoreData.parametersMap.set(param.name, { param, value });
      }
    }, 600 );
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
    }  else if (this.proposalType === ProposalType.CONTRACT) {
      // check if every score data is valid
      const validScoreData = this.newProposalScoreDataArray.every(scoreData => {
        return scoreData.selectedContract && scoreData.selectedMethod && this.allMethodParamsAreInParamsMap(scoreData);

      if (!validScoreData) return false;
      });
    }

    return true;
  }

  userHasEnoughBOmm(): boolean {
    return this.persistenceService.userbOmmBalance.gte(this.persistenceService.getMinBOmmRequiredForProposal());
  }

  userHasEnoughOmm(): boolean {
    const userOmmBalance = this.persistenceService.userOmmTokenBalanceDetails?.availableBalance ?? new BigNumber(0);
    return userOmmBalance.gte(this.voteDefinitionFee());
  }

  constructParameters(scoreData: NewProposalScoreData): IScorePayloadParameter[] {
    const parameters: IScorePayloadParameter[] = [];
    this.methodParamsMap.get(scoreData.selectedMethod ?? "")?.forEach(param => {
      const paramInput = scoreData.parametersMap.get(param.name);

      if (paramInput == undefined && this.paramIsRequired(param)) throw new Error(`Parameter ${param.name} does not exist in parametersMap!`);

      if (paramInput && paramInput.value) {
        parameters.push({
          type: scoreParamToPayloadParam(param.type),
          value: paramInput.value
        })
      }
    })

    return parameters;
  }

  constructTransactionsJson(): any[] {
    return this.newProposalScoreDataArray.map(scoreData => {
      return {
        address: scoreData.selectedContract,
        method: scoreData.selectedMethod,
        parameters: this.constructParameters(scoreData)
      }
    });
  }

  allMethodParamsAreInParamsMap(scoreData: NewProposalScoreData): boolean {
    const methodParams = this.methodParamsMap.get(scoreData.selectedMethod ?? "");
    return methodParams ? methodParams.every(param => this.paramIsRequired(param) ? scoreData.parametersMap.get(param.name) != undefined : true) : false;
  }

  getPlaceholder(param: string): string {
    return getPlaceholderForParam(param);
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
      for (const scoreData of this.newProposalScoreDataArray) {
        if (!scoreData.selectedContract) {
          this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_CONTRACT);
          break;
        }
        else if (!scoreData.selectedMethod) {
          this.notificationService.showNewNotification(NEW_PROPOSAL_EMPTY_METHOD);
          break;
        }
        else if (!this.allMethodParamsAreInParamsMap(scoreData)) {
          this.notificationService.showNewNotification(NEW_PROPOSAL_MISSING_PARAMETERS);
          break;
        }
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

    log.debug("transactions:", this.transactions);


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
