import {Injectable} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {UserReserveData, UserReserves} from "../../models/UserReserveData";
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag, CollateralAssetTag} from "../../models/Asset";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {UserAccountData} from "../../models/UserAccountData";
import {ModalAction, ModalActionsResult} from "../../models/ModalAction";
import {OmmRewards} from "../../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {PrepList} from "../../models/Preps";
import {YourPrepVote} from "../../models/YourPrepVote";
import log from "loglevel";
import {PoolData} from "../../models/PoolData";
import {UserPoolData} from "../../models/UserPoolData";
import {AllAssetDistPercentages} from "../../models/AllAssetDisPercentages";
import BigNumber from "bignumber.js";
import {Proposal} from "../../models/Proposal";
import {Vote} from "../../models/Vote";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that manages state changes
 */
export class StateChangeService {

  /**
   * login change
   */
  public loginChange: Subject<IconexWallet | BridgeWallet | undefined> = new Subject<IconexWallet | BridgeWallet | undefined>();

  /**
   * Map containing subscribable Subjects for each of the Asset (e.g. USDb, ICX, ..)
   */
  public userBalanceChangeMap: Map<AssetTag, Subject<BigNumber>> = new Map([
    [AssetTag.USDS, new Subject<BigNumber>()],
    [AssetTag.ICX, new Subject<BigNumber>()],
    [AssetTag.USDC, new Subject<BigNumber>()],
  ]);

  public userCollateralBalanceChangeMap: Map<CollateralAssetTag, Subject<BigNumber>> = new Map([
    [CollateralAssetTag.USDS, new Subject<BigNumber>()],
    [CollateralAssetTag.sICX, new Subject<BigNumber>()],
    [CollateralAssetTag.USDC, new Subject<BigNumber>()],
  ]);

  /**
   * Map containing subscribable Subjects for each of the Asset reserve (e.g. USDb, ICX, ..)
   */
  public userReserveChangeMap: Map<AssetTag, Subject<UserReserveData>> = new Map([
    [AssetTag.USDS, new Subject<UserReserveData>()],
    [AssetTag.ICX, new Subject<UserReserveData>()],
    [AssetTag.USDC, new Subject<UserReserveData>()],
  ]);

  private userAllReserveChange: Subject<UserReserves> = new Subject<UserReserves>();
  userAllReserveChange$: Observable<UserReserves> = this.userAllReserveChange.asObservable();


  /**
   * Subscribable subject for user account data change
   */
  public userAccountDataChange: Subject<UserAccountData> = new Subject<UserAccountData>();

  public userOmmRewardsChange: Subject<OmmRewards> = new Subject<OmmRewards>();
  public userOmmTokenBalanceDetailsChange: Subject<OmmTokenBalanceDetails> = new Subject<OmmTokenBalanceDetails>();
  public totalOmmStakedChange: Subject<BigNumber> = new Subject<BigNumber>();
  public voteDefinitionFeeChange: Subject<BigNumber> = new Subject<BigNumber>();
  public voteDefinitionCriterionChange: Subject<BigNumber> = new Subject<BigNumber>();
  public proposalListChange: Subject<Proposal[]> = new Subject<Proposal[]>();

  public yourVotesPrepChange: Subject<YourPrepVote[]> = new Subject<YourPrepVote[]>();
  public prepListChange: Subject<PrepList> = new Subject<PrepList>();

  /**
   * Subscribable subject for monitoring the user modal action changes (supply, withdraw, ..)
   * Example: when user confirms the modal action, this Subject should get updated
   */
  public userModalActionChange: Subject<ModalAction> = new Subject<ModalAction>();
  public userModalActionResult: Subject<ModalActionsResult> = new Subject<ModalActionsResult>();

  /**
   * Subscribable subject for monitoring the user total risk changes
   */
  public userTotalRiskChange: Subject<BigNumber> = new Subject<BigNumber>();

  /**
   * Subscribable subject for monitoring the pools data
   */
  private poolsDataChange: Subject<PoolData[]> = new Subject<PoolData[]>();
  poolsDataChange$: Observable<PoolData[]> = this.poolsDataChange.asObservable();

  private userPoolsDataChange: Subject<UserPoolData[]> = new Subject<UserPoolData[]>();
  userPoolsDataChange$: Observable<UserPoolData[]> = this.userPoolsDataChange.asObservable();

  private onPoolClick: Subject<UserPoolData | PoolData> = new Subject<UserPoolData | PoolData>();
  onPoolClick$: Observable<UserPoolData | PoolData> = this.onPoolClick.asObservable();

  private allAssetDistPercentagesChange: Subject<AllAssetDistPercentages> = new Subject<AllAssetDistPercentages>();
  allAssetDistPercentagesChange$: Observable<AllAssetDistPercentages> = this.allAssetDistPercentagesChange.asObservable();

  private ommPriceChange: Subject<BigNumber> = new Subject<BigNumber>();
  ommPriceChange$: Observable<BigNumber> = this.ommPriceChange.asObservable();

  private tokenDistributionPerDayChange: Subject<BigNumber> = new Subject<BigNumber>();
  tokenDistributionPerDayChange$: Observable<BigNumber> = this.tokenDistributionPerDayChange.asObservable();

  private sIcxSelectedChange: Subject<boolean> = new Subject<boolean>();
  sIcxSelectedChange$: Observable<boolean> = this.sIcxSelectedChange.asObservable();

  private selectedProposalChange: Subject<Proposal> = new Subject<Proposal>();
  selectedProposalChange$: Observable<Proposal> = this.selectedProposalChange.asObservable();

  private userProposalVotesChange: Subject<{proposalId: BigNumber, vote: Vote}> = new Subject<{proposalId: BigNumber, vote: Vote}>();
  userProposalVotesChange$: Observable<{proposalId: BigNumber, vote: Vote}> = this.userProposalVotesChange.asObservable();

  private userDataReload: Subject<void> = new Subject<void>();
  userDataReload$: Observable<void> = this.userDataReload.asObservable();

  /**
   * Subscribable subject for monitoring the user debt changes for each asset
   */
  public userDebtMapChange: Map<AssetTag, Subject<BigNumber | undefined>> = new Map([
    [AssetTag.USDS, new Subject<BigNumber | undefined>()],
    [AssetTag.ICX, new Subject<BigNumber | undefined>()],
    [AssetTag.USDC, new Subject<BigNumber | undefined>()],
  ]);


  constructor(private persistenceService: PersistenceService) {
    this.userBalanceChangeMap.forEach((subject: Subject<BigNumber>, key: AssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.balances.set(key, value);
        }
      });
    });

    this.userCollateralBalanceChangeMap.forEach((subject: Subject<BigNumber>, key: CollateralAssetTag) => {
      subject.subscribe(value => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.activeWallet.collateralBalances.set(key, value);
        }
      });
    });

    this.userReserveChangeMap.forEach((subject: Subject<UserReserveData>, assetTag: AssetTag) => {
      subject.subscribe((value: UserReserveData) => {
        if (this.persistenceService.activeWallet) {
          this.persistenceService.userReserves.reserveMap.set(assetTag, value);
        }
      });
    });

    this.userDebtMapChange.forEach((subject: Subject<BigNumber | undefined>, assetTag: AssetTag) => {
      subject.subscribe((value: BigNumber | undefined) => {
        if (this.persistenceService.activeWallet) {
          log.debug(`Loaded asset ${assetTag} debt ${value}...`);
          this.persistenceService.userDebt.set(assetTag, value);
        }
      });
    });
  }

  public allAssetDistPercentagesUpdate(value: AllAssetDistPercentages): void {
    this.persistenceService.allAssetDistPercentages = value;
    this.allAssetDistPercentagesChange.next(value);
  }

  public userDataReloadUpdate(): void {
    this.userDataReload.next();
  }

  public tokenDistributionPerDayUpdate(value: BigNumber): void {
    this.persistenceService.tokenDistributionPerDay = value;
    this.tokenDistributionPerDayChange.next(value);
  }

  public ommPriceUpdate(value: BigNumber): void {
    this.persistenceService.ommPriceUSD = value;
    this.ommPriceChange.next(value);
  }

  public poolClickCUpdate(pool: PoolData | UserPoolData): void {
    this.onPoolClick.next(pool);
  }

  public sIcxSelectedUpdate(sIcxSelected: boolean): void {
    this.sIcxSelectedChange.next(sIcxSelected);
  }

  public selectedProposalUpdate(proposal: Proposal | undefined): void {
    this.selectedProposalChange.next(proposal);
  }

  public userProposalVotesUpdate(proposalId: BigNumber, vote: Vote): void {
    this.persistenceService.userProposalVotes.set(proposalId, vote);
    this.userProposalVotesChange.next({proposalId, vote});
  }

  public poolsDataUpdate(poolsData: PoolData[]): void {
    this.persistenceService.allPools = [...poolsData];
    this.poolsDataChange.next(poolsData);
  }

  public userPoolsDataUpdate(userPoolsData: UserPoolData[]): void {
    this.persistenceService.userPools = [...userPoolsData];
    this.userPoolsDataChange.next(userPoolsData);
  }

  public updateLoginStatus(wallet: IconexWallet | BridgeWallet | undefined): void {
    this.loginChange.next(wallet);
  }

  public updateUserTotalRisk(totalRisk: BigNumber): void {
    this.persistenceService.userTotalRisk = totalRisk;
    this.userTotalRiskChange.next(totalRisk);
  }

  public updateUserAssetBalance(balance: BigNumber, assetTag: AssetTag): void {
    this.persistenceService.activeWallet!.balances.set(assetTag, balance);
    this.userBalanceChangeMap.get(assetTag)!.next(balance);
  }

  public updateUserCollateralAssetBalance(balance: BigNumber, assetTag: CollateralAssetTag): void {
    this.userCollateralBalanceChangeMap.get(assetTag)!.next(balance);
  }

  public updateUserDebt(debt: BigNumber, assetTag: AssetTag): void {
    this.userDebtMapChange.get(assetTag)!.next(debt);
  }

  public updateUserAssetReserve(reserve: UserReserveData, assetTag: AssetTag): void {
    this.userReserveChangeMap.get(assetTag)!.next(reserve);
  }

  public updateUserAllReserve(userReserves: UserReserves): void {
    this.userAllReserveChange.next(userReserves);
  }


  public updateUserAccountData(userAccountData: UserAccountData): void {
    this.userAccountDataChange.next(userAccountData);
  }

  public updateUserOmmRewards(userOmmRewards: OmmRewards): void {
    this.userOmmRewardsChange.next(userOmmRewards);
  }

  public updateUserOmmTokenBalanceDetails(userOmmTokenBalanceDetails: OmmTokenBalanceDetails): void {
    this.userOmmTokenBalanceDetailsChange.next(userOmmTokenBalanceDetails);
  }

  public updateUserDelegations(yourVotesPrep: YourPrepVote[]): void {
    this.yourVotesPrepChange.next(yourVotesPrep);
  }

  public updatePrepList(prepList: PrepList): void {
    this.persistenceService.prepList = prepList;
    this.prepListChange.next(prepList);
  }

  public updateTotalStakedOmm(totalStakedOmm: BigNumber): void {
    this.persistenceService.totalStakedOmm = totalStakedOmm;
    this.totalOmmStakedChange.next(totalStakedOmm);
  }

  public updateVoteDefinitionFee(voteDefinitionFee: BigNumber): void {
    this.persistenceService.voteDefinitionFee = voteDefinitionFee;
    this.voteDefinitionFeeChange.next(voteDefinitionFee);
  }

  public updateVoteDefinitionCriterion(voteDefinitionCriterion: BigNumber): void {
    this.persistenceService.voteDefinitionCriterion = voteDefinitionCriterion;
    this.voteDefinitionCriterionChange.next(voteDefinitionCriterion);
  }

  public updateProposalsList(proposalList: Proposal[]): void {
    this.persistenceService.proposalList = [...proposalList];
    this.proposalListChange.next(proposalList);
  }

  public updateUserModalAction(modalAction: ModalAction): void {
    this.userModalActionChange.next(modalAction);
  }

}
