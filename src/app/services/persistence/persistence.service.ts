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
  public allPoolsDataMap: Map<number, PoolData> = new Map<number, PoolData>();

  public userPools: UserPoolData[] = [];
  public userPoolsDataMap: Map<number, UserPoolData> = new Map<number, UserPoolData>();

  public userReserves: UserReserves = new UserReserves();
  public userTotalRisk = 0;

  public userAccountData?: UserAccountData;
  public userOmmRewards?: OmmRewards;
  public userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  public userUnstakingInfo?: UnstakeInfo;
  public userClaimableIcx?: number;
  public userDebt: Map<CollateralAssetTag, number | undefined> = new Map<CollateralAssetTag, number | undefined>();
  public minOmmStakeAmount = 1;
  public totalStakedOmm = 0;
  public ommPriceUSD = -1; // -1 indicates that ommPriceUSD is not set

  public tokenDistributionPerDay = 1000000;
  public loanOriginationFeePercentage = 0.001;
  public distributionPercentages?: DistributionPercentages;

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
    this.userTotalRisk = 0;
    this.userReserves = new UserReserves();
  }

  public getDistPercentageOfPool(poolId: number): number {
    return this.allPoolsDistPercentages?.getDistPercentageForPool(poolId) ?? 0;
  }

  public getUserPoolStakedBalance(poolId: number): number {
    return this.userPoolsDataMap.get(poolId)?.userStakedBalance ?? 0;
  }

  public getUserPoolStakedAvailableBalance(poolId: number): number {
    return this.userPoolsDataMap.get(poolId)?.userAvailableBalance ?? 0;
  }

  public getUserPoolTotalBalance(poolId: number): number {
    return this.userPoolsDataMap.get(poolId)?.userTotalBalance ?? 0;
  }

  public getUserTotalUnstakeAmount(): number {
    return this.userUnstakingInfo?.totalAmount ?? 0;
  }

  public getLtvForReserve(assetTag: AssetTag): number {
    return this.getAssetReserveData(assetTag)?.baseLTVasCollateral ?? 0;
  }

  public getTotalAssetBorrows(assetTag: AssetTag): number {
    return this.getAssetReserveData(assetTag)?.totalBorrows ?? 0;
  }

  public getReserveAddressByAssetTag(assetTag: AssetTag): string | undefined {
    return this.allAddresses?.collateralAddress(assetTag);
  }

  public getDecimalsForReserve(assetTag: AssetTag): number | undefined {
    return this.allReserves?.getReserveData(assetTag).decimals;
  }

  public getUserAssetDebt(assetTag: AssetTag): number {
    return this.userDebt.get(assetTag) ?? 0;
  }

  public getUsersStakedOmmBalance(): number {
    return Utils.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails?.stakedBalance ?? 0);
  }

  public getUsersAvailableOmmBalance(): number {
    return Utils.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails?.availableBalance ?? 0);
  }

  public getUserUnstakingOmmBalance(): number {
    return Utils.roundDownToZeroDecimals(this.userOmmTokenBalanceDetails?.unstakingBalance ?? 0);
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

  public getUserUSDbBalance(): number {
    return this.activeWallet?.balances.get(AssetTag.USDS) ?? 0;
  }

  public getUserAssetBalance(assetTag: AssetTag): number {
    return this.activeWallet?.balances.get(assetTag) ?? 0;
  }

  public getUserAssetCollateralBalance(collateralAssetTag: CollateralAssetTag): number {
    return this.activeWallet?.collateralBalances.get(collateralAssetTag) ?? 0;
  }

  public getUserAssetUSDBalance(assetTag: AssetTag): number {
    const balance = this.activeWallet?.balances.get(assetTag) ?? 0;
    const exchangePrice = this.getAssetExchangePrice(assetTag) ?? 0;
    return balance * exchangePrice;
  }

  public getAssetExchangePrice(assetTag: AssetTag): number {
    return this.getAssetReserveData(assetTag)?.exchangePrice ?? 1;
  }

  public sIcxToIcxRate(): number {
    return this.getAssetReserveData(AssetTag.ICX)?.sICXRate ?? 1;
  }

  public getUserSuppliedAssetBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalance ?? 0;
  }

  public getUserSuppliedAssetUSDBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentOTokenBalanceUSD ?? 0;
  }

  public getUserBorrowedAssetBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalance ?? 0;
  }

  public getUserBorrowedAssetUSDBalance(assetTag: AssetTag): number {
    return this.userReserves?.reserveMap.get(assetTag)?.currentBorrowBalanceUSD ?? 0;
  }

  public getUserIcxBalance(): number {
    return this.activeWallet?.balances.get(AssetTag.ICX) ?? 0;
  }

  public getUserAssetReserve(assetTag: AssetTag): UserReserveData | undefined {
    return this.userReserves?.reserveMap.get(assetTag);
  }

  public getAssetReserveData(assetTag: AssetTag): ReserveData | undefined {
    return this.allReserves?.getReserveData(assetTag);
  }

  public getTotalSuppliedUSD(): number {
    let totalSupplied = 0;
    if (!this.allReserves) {
      return totalSupplied;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalSupplied += property.totalLiquidityUSD;
    });
    return totalSupplied;
  }

  public getTotalBorrowedUSD(): number {
    let totalBorrowed = 0;
    if (!this.allReserves) {
      return totalBorrowed;
    }
    Object.values(this.allReserves).forEach((property: ReserveData) => {
      totalBorrowed += property.totalBorrowsUSD;
    });
    return totalBorrowed;
  }

  public getUserTotalSuppliedUSD(): number {
    let totalSupplied = 0;
    if (!this.userReserves) {
      return totalSupplied;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalSupplied += reserve?.currentOTokenBalanceUSD ?? 0;
    });
    return totalSupplied;
  }

  public getUserTotalBorrowedUSD(): number {
    let totalBorrowed = 0;
    if (!this.userReserves) {
      return totalBorrowed;
    }
    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      totalBorrowed += reserve?.currentBorrowBalanceUSD ?? 0;
    });
    return totalBorrowed;
  }

  public getUserAvgSupplyApy(): number {
    let counter = 0;
    let total = 0;

    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      total += reserve?.liquidityRate ?? 0;
      counter++;
    });

    return counter === 0 || total === 0 ? 0 : total / counter;
  }

  public getUserAvgBorrowApy(): number {
    let counter = 0;
    let total = 0;

    this.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined) => {
      total += reserve?.borrowRate ?? 0;
      counter++;
    });

    return counter === 0 || total === 0 ? 0 : total / counter;
  }

  public getYourSupplyApy(): number {
    let supplyApySum = 0;
    let supplySum = 0;
    let supplied;
    let supplyApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.userReserves.reserveMap.forEach(reserve => {
      supplied = reserve?.currentOTokenBalanceUSD ?? 0;
      supplyApy = reserve?.liquidityRate ?? 0;
      supplyApySum += supplied * supplyApy;
      supplySum += supplied;
    });

    return supplyApySum / supplySum;
  }

  public getAverageLiquidationThreshold(): number {
    let counter = 0;
    let total = 0;

    if (!this.allReserves) {
      return total;
    }

    Object.values(this.allReserves!).forEach((property: ReserveData) => {
      total += property.liquidationThreshold;
      counter++;
    });
    return total / counter;
  }

  public userHasNotBorrowedAnyAsset(): boolean {
    for (const value of this.userReserves!.reserveMap.values()) {
      if (value && value!.currentBorrowBalance > 0) {
        return false;
      }
    }
    return true;
  }

  public userHasNotSuppliedAnyAsset(): boolean {
    for (const value of this.userReserves!.reserveMap.values()) {
      if (value && value!.currentOTokenBalance > 0) {
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
    return (this.getUserSuppliedAssetBalance(assetTag) ?? 0) === 0;
  }

  isAssetAvailable(assetTag: AssetTag): boolean {
    const supplied = this.getUserSuppliedAssetBalance(assetTag) ?? 0;
    const balance = this.getUserAssetBalance(assetTag) ?? 0;

    return supplied === 0 && balance > 0;
  }

  public userAssetBorrowedIsZero(assetTag: AssetTag): boolean {
    return (this.getUserBorrowedAssetBalance(assetTag) ?? 0) === 0;
  }

  public userAssetBalanceIsZero(assetTag: AssetTag): boolean {
    return (this.activeWallet?.balances.get(assetTag) ?? 0) === 0;
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
