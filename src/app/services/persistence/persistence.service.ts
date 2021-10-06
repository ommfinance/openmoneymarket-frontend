import {Injectable} from '@angular/core';
import {IconexWallet} from '../../models/wallets/IconexWallet';
import {AllAddresses} from '../../models/AllAddresses';
import {AllReservesData, ReserveData} from "../../models/AllReservesData";
import {UserReserveData, UserReserves} from "../../models/UserReserveData";
import {UserAccountData} from "../../models/UserAccountData";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {AssetTag, CollateralAssetTag} from "../../models/Asset";
import {AllReserveConfigData} from "../../models/AllReserveConfigData";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import {OmmRewards} from "../../models/OmmRewards";
import {OmmTokenBalanceDetails} from "../../models/OmmTokenBalanceDetails";
import {PrepList} from "../../models/Preps";
import {YourPrepVote} from "../../models/YourPrepVote";
import {Utils} from "../../common/utils";
import {UnstakeInfo} from "../../models/UnstakeInfo";
import {DistributionPercentages} from "../../models/DistributionPercentages";
import {PoolData} from "../../models/PoolData";
import {UserPoolData} from "../../models/UserPoolData";
import {PoolsDistPercentages} from "../../models/PoolsDistPercentages";
import {AllAssetDistPercentages} from "../../models/AllAssetDisPercentages";
import {DailyRewardsAllReservesPools} from "../../models/DailyRewardsAllReservesPools";
import BigNumber from "bignumber.js";
import {Proposal} from "../../models/Proposal";
import {Vote} from "../../models/Vote";
import {ProposalLink} from "../../models/ProposalLink";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that holds and manages client data.
 */
export class PersistenceService {

  public activeWallet?: IconexWallet | BridgeWallet | LedgerWallet;

  public allAddresses?: AllAddresses;
  public allReserves?: AllReservesData;
  public allReservesConfigData?: AllReserveConfigData;

  public allPools: PoolData[] = [];
  public allPoolsDistPercentages?: PoolsDistPercentages;
  public allPoolsDataMap: Map<string, PoolData> = new Map<string, PoolData>();

  public userPools: UserPoolData[] = [];
  public userPoolsDataMap: Map<string, UserPoolData> = new Map<string, UserPoolData>();

  public userReserves: UserReserves = new UserReserves();
  public userTotalRisk = new BigNumber("0");

  public userAccountData?: UserAccountData;
  public userOmmRewards?: OmmRewards;
  public userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  public userUnstakingInfo?: UnstakeInfo;
  public userClaimableIcx?: BigNumber;
  public userDebt: Map<CollateralAssetTag, BigNumber | undefined> = new Map<CollateralAssetTag, BigNumber | undefined>();
  public minOmmStakeAmount = new BigNumber("1");
  public totalStakedOmm = new BigNumber("0");
  public totalSuppliedOmm = new BigNumber("0");
  public ommPriceUSD = new BigNumber("-1"); // -1 indicates that ommPriceUSD is not set

  public tokenDistributionPerDay = new BigNumber("0");
  public loanOriginationFeePercentage = new BigNumber("0.001");
  public distributionPercentages?: DistributionPercentages;
  public allAssetDistPercentages?: AllAssetDistPercentages;
  public dailyRewardsAllPoolsReserves?: DailyRewardsAllReservesPools;

  public voteDefinitionFee = new BigNumber("0");
  public voteDefinitionCriterion = new BigNumber("0");
  public proposalList: Proposal[] = [];
  public userVotingWeightForProposal: Map<BigNumber, BigNumber> = new Map<BigNumber, BigNumber>(); // proposalId to voting weight
  public proposalLinks: Map<string, ProposalLink> = new Map<string, ProposalLink>();
  public userVotingWeight: BigNumber = new BigNumber("0");
  public userProposalVotes: Map<BigNumber, Vote> = new Map<BigNumber, Vote>();
  public voteDuration = new BigNumber("-1");


  public prepList?: PrepList;
  public yourVotesPrepList: YourPrepVote[] = [];

  constructor() {}

  public userLoggedIn(): boolean {
    return this.activeWallet != null;
  }

  public logoutUser(): void {
    this.activeWallet = undefined;

    // reset values
    this.yourVotesPrepList = [];
    this.userOmmTokenBalanceDetails = undefined;
    this.userOmmRewards = undefined;
    this.userAccountData = undefined;
    this.userTotalRisk = new BigNumber("0");
    this.userReserves = new UserReserves();
  }

  getMinOmmStakedRequiredForProposal(): BigNumber {
    return this.totalSuppliedOmm.multipliedBy(this.voteDefinitionCriterion);
  }

  public getDistPercentageOfPool(poolId: BigNumber): BigNumber {
    return this.allPoolsDistPercentages?.getDistPercentageForPool(poolId) ?? new BigNumber("0");
  }

  public getUserPoolStakedBalance(poolId: BigNumber): BigNumber {
    return this.userPoolsDataMap.get(poolId.toString())?.userStakedBalance ?? new BigNumber("0");
  }

  public getUserPoolStakedAvailableBalance(poolId: BigNumber): BigNumber {
    return this.userPoolsDataMap.get(poolId.toString())?.userAvailableBalance ?? new BigNumber("0");
  }

  public getUserPoolTotalBalance(poolId: BigNumber): BigNumber {
    return this.userPoolsDataMap.get(poolId.toString())?.userTotalBalance ?? new BigNumber("0");
  }

  public getUserTotalUnstakeAmount(): BigNumber {
    return this.userUnstakingInfo?.totalAmount ?? new BigNumber("0");
  }

  public getLtvForReserve(assetTag: AssetTag): BigNumber {
    return this.getAssetReserveData(assetTag)?.baseLTVasCollateral ?? new BigNumber("0");
  }

  public getTotalAssetBorrows(assetTag: AssetTag): BigNumber {
    return this.getAssetReserveData(assetTag)?.totalBorrows ?? new BigNumber("0");
  }

  public getReserveAddressByAssetTag(assetTag: AssetTag): string | undefined {
    return this.allAddresses?.collateralAddress(assetTag);
  }

  public getDecimalsForReserve(assetTag: AssetTag): BigNumber | undefined {
    return this.allReserves?.getReserveData(assetTag).decimals;
  }

  public getUserAssetDebt(assetTag: AssetTag): BigNumber {
    return this.userDebt.get(assetTag) ?? new BigNumber("0");
  }

  public getUsersStakedOmmBalance(): BigNumber {
    return (this.userOmmTokenBalanceDetails?.stakedBalance ?? new BigNumber("0")).dp(0);
  }

  public getUsersAvailableOmmBalance(): BigNumber {
    return (this.userOmmTokenBalanceDetails?.availableBalance ?? new BigNumber("0")).dp(0);
  }

  public getUserUnstakingOmmBalance0Rounded(): BigNumber {
    return (this.userOmmTokenBalanceDetails?.unstakingBalance ?? new BigNumber("0")).dp(0);
  }

  publicGetActiveIconAddress(): string | undefined {
    return this.activeWallet?.address;
  }

  public bridgeWalletActive(): boolean {
    return this.activeWallet instanceof BridgeWallet;
  }

  public iconexWalletActive(): boolean {
    return this.activeWallet instanceof IconexWallet;
  }

  public getUserAssetBalance(assetTag: AssetTag): BigNumber {
    return this.activeWallet?.balances.get(assetTag) ?? new BigNumber("0");
  }

  public getUserAssetCollateralBalance(collateralAssetTag: CollateralAssetTag): BigNumber {
    return this.activeWallet?.collateralBalances.get(collateralAssetTag) ?? new BigNumber("0");
  }

  public getUserAssetUSDBalance(assetTag: AssetTag): BigNumber {
    const balance = this.activeWallet?.balances.get(assetTag) ?? new BigNumber("0");
    const exchangePrice = this.getAssetExchangePrice(assetTag) ?? new BigNumber("0");
    return balance.multipliedBy(exchangePrice);
  }

  public getAssetExchangePrice(assetTag: AssetTag | CollateralAssetTag): BigNumber {
    if (assetTag === CollateralAssetTag.sICX) {
      const sIcxRate = this.sIcxToIcxRate();
      return Utils.convertICXToSICXPrice(this.getAssetReserveData(AssetTag.ICX)?.exchangePrice ?? new BigNumber("0"), sIcxRate);
    }

    return this.getAssetReserveData(assetTag)?.exchangePrice ?? new BigNumber("0");
  }

  public sIcxToIcxRate(): BigNumber {
    return this.getAssetReserveData(AssetTag.ICX)?.sICXRate ?? new BigNumber("1");
  }

  public getUserSuppliedAssetBalance(assetTag: AssetTag): BigNumber {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalance ?? new BigNumber("0");
  }

  public getUserSuppliedAssetUSDBalance(assetTag: AssetTag | CollateralAssetTag): BigNumber {
    if (assetTag === CollateralAssetTag.sICX) {
      return this.getUserAssetCollateralBalance(assetTag);
    }

    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalanceUSD ?? new BigNumber("0");
  }

  public getUserBorrowedAssetBalancePlusOrigFee(assetTag: AssetTag): BigNumber {
    const originationFee = this.userReserves?.reserveMap.get(assetTag)?.originationFee ?? new BigNumber("0");
    const borrowBalance = this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalance ?? new BigNumber("0");
    return originationFee.plus(borrowBalance);
  }

  public getUserBorrAssetBalance(assetTag: AssetTag): BigNumber {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalance ?? new BigNumber("0");
  }

  public getUserBorrowedAssetUSDBalance(assetTag: AssetTag): BigNumber {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalanceUSD ?? new BigNumber("0");
  }

  public getUserAssetReserve(assetTag: AssetTag): UserReserveData | undefined {
    return this.userReserves?.reserveMap.get(assetTag);
  }

  public getUserAssetReserveLiquidityRate(assetTag: AssetTag | CollateralAssetTag): BigNumber {
    if (assetTag === CollateralAssetTag.sICX) {
      return this.getUserAssetReserve(AssetTag.ICX)?.liquidityRate ?? new BigNumber("0");
    }
    return this.getUserAssetReserve(assetTag)?.liquidityRate ?? new BigNumber("0");
  }

  public getAssetReserveData(assetTag: AssetTag): ReserveData | undefined {
    return this.allReserves?.getReserveData(assetTag);
  }

  public getTotalSuppliedUSD(): BigNumber {
    let totalSupplied = new BigNumber("0");
    if (!this.allReserves) {
      return totalSupplied;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalSupplied = totalSupplied.plus(property.totalLiquidityUSD);
    });
    return totalSupplied;
  }

  public getTotalBorrowedUSD(): BigNumber {
    let totalBorrowed = new BigNumber("0");
    if (!this.allReserves) {
      return totalBorrowed;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalBorrowed = totalBorrowed.plus(property.totalBorrowsUSD);
    });
    return totalBorrowed;
  }

  public getUserTotalSuppliedUSD(): BigNumber {
    let totalSupplied = new BigNumber("0");
    if (!this.userReserves) {
      return totalSupplied;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalSupplied = totalSupplied.plus((reserve?.currentOTokenBalanceUSD ?? new BigNumber("0")));
    });
    return totalSupplied;
  }

  public getUserTotalBorrowedUSD(): BigNumber {
    let totalBorrowed = new BigNumber("0");
    if (!this.userReserves) {
      return totalBorrowed;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      const originationFee = reserve?.originationFee ?? new BigNumber("0");
      const exchangeRate = reserve?.exchangeRate ?? new BigNumber("0");
      const borrowBalanceUSD = reserve?.currentBorrowBalanceUSD ?? new BigNumber("0");
      totalBorrowed = totalBorrowed.plus(borrowBalanceUSD).plus(originationFee.multipliedBy(exchangeRate));
    });
    return totalBorrowed;
  }

  public getAverageLiquidationThreshold(): BigNumber {
    let counter = new BigNumber("0");
    let total = new BigNumber("0");

    if (!this.allReserves) {
      return total;
    }

    Object.values(this.allReserves).forEach((property: ReserveData) => {
      total = total.plus(property.liquidationThreshold);
      counter = counter.plus(new BigNumber("1"));
    });
    return total.dividedBy(counter);
  }

  public getAverageLtv(): BigNumber {
    let counter = new BigNumber("0");
    let total = new BigNumber("0");

    if (!this.allReserves) {
      return total;
    }

    Object.values(this.allReserves).forEach((property: ReserveData) => {
      total = total.plus(property.baseLTVasCollateral);
      counter = counter.plus(new BigNumber("1"));
    });
    return total.dividedBy(counter);
  }

  public userHasNotBorrowedAnyAsset(): boolean {
    for (const value of this.userReserves.reserveMap.values()) {
      if (value && value.currentBorrowBalance.isGreaterThan(Utils.ZERO)) {
        return false;
      }
    }
    return true;
  }

  public userHasNotSuppliedAnyAsset(): boolean {
    for (const value of this.userReserves.reserveMap.values()) {
      if (value && value.currentOTokenBalance.isGreaterThan(Utils.ZERO)) {
        return false;
      }
    }
    return true;
  }

  public userAssetSuppliedOrBorrowedNotZero(assetTag: AssetTag): boolean {
    return !this.userAssetSuppliedIsZero(assetTag) || !this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetSuppliedAndBorrowedIsZero(assetTag: AssetTag): boolean {
    return this.userAssetSuppliedIsZero(assetTag) && this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetWalletSupplyAndBorrowIsZero(assetTag: AssetTag): boolean {
    // If asset-user wallet, supply, and borrow balance = 0
    return this.userAssetBalanceIsZero(assetTag)
      && this.userAssetSuppliedIsZero(assetTag)
      && this.userAssetBorrowedIsZero(assetTag);
  }

  public userAssetSuppliedIsZero(assetTag: AssetTag): boolean {
    return (this.getUserSuppliedAssetBalance(assetTag) ?? new BigNumber("0")).isZero();
  }

  isAssetAvailable(assetTag: AssetTag): boolean {
    const supplied = this.getUserSuppliedAssetBalance(assetTag) ?? new BigNumber("0");
    const balance = this.getUserAssetBalance(assetTag) ?? new BigNumber("0");

    return supplied.isZero() && balance.isGreaterThan(Utils.ZERO);
  }

  public userAssetBorrowedIsZero(assetTag: AssetTag): boolean {
    return (this.getUserBorrAssetBalance(assetTag) ?? new BigNumber("0")).isZero();
  }

  public userAssetBalanceIsZero(assetTag: AssetTag): boolean {
    return (this.activeWallet?.balances.get(assetTag) ?? new BigNumber("0")).isZero();
  }

  public isAssetSuppliedBorrowedBalanceZero(assetTag: AssetTag): boolean {
    return this.userAssetSuppliedIsZero(assetTag)
      && this.userAssetBorrowedIsZero(assetTag)
      && this.userAssetBalanceIsZero(assetTag);
  }

  public isAssetAvailableToSupply(assetTag: AssetTag): boolean {
    // if user has not supplied or borrowed the asset and has balance of it > 0
    return this.userAssetSuppliedIsZero(assetTag) && this.userAssetBorrowedIsZero(assetTag)  && !this.userAssetBalanceIsZero(assetTag);
  }

  // asset is active if is either supplied or borrowed (available to borrow should be also considered using calc service)
  public assetSuppliedOrBorrowed(assetTag: AssetTag): boolean {
    return !this.userAssetSuppliedIsZero(assetTag) || !this.userAssetBorrowedIsZero(assetTag) ;
  }

}
