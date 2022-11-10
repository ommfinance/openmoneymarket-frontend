import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Prep, PrepList} from "../../../models/classes/Preps";
import {Subscription} from "rxjs";
import {PersistenceService} from "../../../services/persistence/persistence.service";
import {Utils} from "../../../common/utils";
import {StateChangeService} from "../../../services/state-change/state-change.service";
import {YourPrepVote} from "../../../models/classes/YourPrepVote";
import {contributorsMap, defaultPrepLogoUrl, prepsOfferingIncentiveMap} from "../../../common/constants";
import BigNumber from "bignumber.js";
import {AssetTag} from "../../../models/classes/Asset";
import {CalculationsService} from "../../../services/calculations/calculations.service";


@Component({
  selector: 'app-prep-list',
  templateUrl: './prep-list.component.html'
})
export class PrepListComponent implements OnInit, OnDestroy {

  @Input() yourVotesPrepList!: YourPrepVote[];
  @Input() yourVotesEditMode!: boolean;

  @Output() addYourVotePrepEvent = new EventEmitter<Prep>();
  @Output() removeYourVotePrepEvent = new EventEmitter<Prep>();

  /** subscriptions */
  userDataReloadedSub?: Subscription;
  coreDataReloadedSub?: Subscription;
  loginSub?: Subscription;

  searchInput = "";

  /** template variables */
  prepList?: PrepList;
  prepsUSDRewardMap = new Map<string, BigNumber>();
  prepsIcxRewardMap = new Map<string, BigNumber>();
  prepPowerPercentMap = new Map<string, BigNumber>();
  incentivePrepsMap = new Map<number, boolean>();
  top100Selected = true;

  userLoggedIn = false;
  userHasLockedOmm = false;


  constructor(private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private calculationsService: CalculationsService) { }

  ngOnInit(): void {
    this.initCoreData();
    this.initUserData();
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.userDataReloadedSub?.unsubscribe();
    this.coreDataReloadedSub?.unsubscribe();
    this.loginSub?.unsubscribe();
  }

  registerSubscriptions(): void {
    this.subscribeToCoreDataReload();
    this.subscribeToUserLoginChange();
    this.subscribeToUserDataReload();
  }

  subscribeToUserLoginChange(): void {
    this.stateChangeService.loginChange$.subscribe((wallet => {
      this.userLoggedIn = wallet !== undefined;
    }));
  }

  subscribeToUserDataReload(): void {
    this.userDataReloadedSub = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.initCoreData();
      this.initUserData();
    });
  }

  subscribeToCoreDataReload(): void {
    this.coreDataReloadedSub = this.stateChangeService.afterCoreDataReload$.subscribe(() => {
      this.initCoreData();
      this.initUserData();
    });
  }

  initCoreData(): void {
    this.searchInput = "";
    this.prepsUSDRewardMap = new Map<string, BigNumber>();
    this.prepsIcxRewardMap = new Map<string, BigNumber>();
    this.prepPowerPercentMap = new Map<string, BigNumber>();
    this.top100Selected = true;
    this.prepList = this.persistenceService.prepList;
    this.prepList?.preps.forEach((prep, index) => {
      this.prepsUSDRewardMap.set(prep.address, this.calculatePrepsUSDReward(prep, index));
      this.prepsIcxRewardMap.set(prep.address, this.calculatePrepsIcxReward(prep, index));
      this.prepPowerPercentMap.set(prep.address, this.calculatePowerPercent(prep));
      this.incentivePrepsMap.set(index, this.isPrepOfferingIncentive(prep.address));
    });
  }

  initUserData(): void {
    this.userHasLockedOmm = this.persistenceService.getUsersLockedOmmBalance().isGreaterThan(Utils.ZERO);
    this.userLoggedIn = this.persistenceService.userLoggedIn();
  }

  onSearchInputChange(searchInput: string): void {
    this.searchInput = searchInput.toLowerCase();
  }

  prepMatchesSearchInput(prep: Prep): boolean {
    return prep.name.toLowerCase().includes(this.searchInput);
  }

  onTop100Click(): void {
    this.top100Selected = true;
  }

  onIncentivisedClick(): void {
    this.top100Selected = false;
  }

  getPrepsUSDReward(prep: Prep): BigNumber {
    return this.prepsUSDRewardMap.get(prep.address) ?? new BigNumber(0);
  }

  calculatePrepsUSDReward(prep: Prep, index: number): BigNumber {
    const prepsIcxReward = this.calculatePrepsIcxReward(prep, index);
    const icxExchangePrice = this.persistenceService.getAssetExchangePrice(AssetTag.ICX);
    return prepsIcxReward.multipliedBy(icxExchangePrice);
  }

  getPrepsIcxReward(prep: Prep): BigNumber {
    return this.prepsIcxRewardMap.get(prep.address) ?? new BigNumber(0);
  }

  calculatePrepsIcxReward(prep: Prep, index: number): BigNumber {
    if (!this.prepList) {
      return new BigNumber("0");
    }

    return this.calculationsService.calculatePrepsIcxReward(prep, this.prepList, index);
  }

  getPrepsPowerPercent(prep: Prep): BigNumber {
    return this.prepPowerPercentMap.get(prep.address) ?? new BigNumber(0);
  }

  calculatePowerPercent(prep: any): BigNumber {
    return this.prepList ? prep.power.dividedBy(this.prepList.totalPower) : new BigNumber(0);
  }

  public listIsNotNullOrEmpty(list?: any[]): boolean {
    return (list != null && list.length > 0);
  }

  prepIsInYourVotes(prep: Prep): boolean {
    for (const p of this.yourVotesPrepList) {
      if (p.address === prep.address) {
        return true;
      }
    }
    return false;
  }

  isPrepOmmContributor(address: string): boolean {
    return contributorsMap.get(address) ?? false;
  }

  isPrepOfferingIncentive(address: string | number): boolean {
    if (typeof address === "string") {
      return prepsOfferingIncentiveMap.get(address) ?? false;
    } else {
      return this.incentivePrepsMap.get(address) ?? false;
    }
  }

  addYourVotePrep(prep: Prep): void {
    this.addYourVotePrepEvent.emit(prep);
  }

  removeYourVotePrepByAddress(prep: Prep): void {
    this.removeYourVotePrepEvent.emit(prep);
  }

  errorHandlerPrepLogo($event: any): void {
    $event.target.src = defaultPrepLogoUrl;
  }
}
