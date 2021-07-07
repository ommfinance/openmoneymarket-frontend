import {Injectable} from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";
import {UserAction} from "../../models/UserAction";
import {ReserveData} from "../../models/AllReservesData";
import {StateChangeService} from "../state-change/state-change.service";
import {Utils} from "../../common/utils";
import {Prep, PrepList} from "../../models/Preps";
import {OmmError} from "../../core/errors/OmmError";
import {UserReserveData} from "../../models/UserReserveData";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  className = "[CalculationsService]";

  constructor(private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService) { }

  public calculateBorrowApyWithOmmRewards(assetTag: AssetTag): number {
    const borrowRate = this.persistenceService.getAssetReserveData(assetTag)?.borrowRate ?? 0;
    const tokenDistributionPerDay = this.persistenceService.tokenDistributionPerDay;
    const totalInterestOverAYear = this.borrowTotalInterestOverAYear();
    return this.borrowOmmApyFormula(borrowRate, totalInterestOverAYear, tokenDistributionPerDay,
      this.persistenceService.ommPriceUSD);
  }

  public borrowOmmApyFormula(borrowRate: number, totalInterestOverAYear: number, tokenDistributionPerDay: number,
                             ommPriceUSD: number): number {
    return borrowRate / totalInterestOverAYear * tokenDistributionPerDay * ommPriceUSD * 0.2 * 365;
  }

  public calculateSupplyApyWithOmmRewards(assetTag: AssetTag): number {
    const liquidityRate = this.persistenceService.getAssetReserveData(assetTag)?.liquidityRate ?? 0;
    const totalInterestOverAYear = this.supplyTotalInterestOverAYear();
    const tokenDistributionPerDay = this.persistenceService.tokenDistributionPerDay;

    return this.supplyOmmApyFormula(liquidityRate, totalInterestOverAYear, tokenDistributionPerDay, this.persistenceService.ommPriceUSD);
  }

  public supplyOmmApyFormula(liquidityRate: number, totalInterestOverAYear: number, tokenDistributionPerDay: number,
                             ommPriceUSD: number): number {
    return liquidityRate / totalInterestOverAYear * tokenDistributionPerDay * ommPriceUSD * 0.2 * 365;
  }

  /**
   * @description sum(sum(CollateralBalanceUSD * liquidityRate)) for all users
   * @return Number
   */
  public supplyTotalInterestOverAYear(): number {
    let allUsersCollateralSumRate = 0;

    if (this.persistenceService.allReserves) {
      Object.values(this.persistenceService.allReserves).forEach((reserve: ReserveData) => {
        allUsersCollateralSumRate += reserve.totalLiquidityUSD * reserve.liquidityRate;
      });

      return allUsersCollateralSumRate;
    } else {
      throw new OmmError("getAllUsersCollateralSumRate -> this.persistenceService.allReserves is undefined");
    }
  }

  /**
   * @description formula = sum(sum(BorrowBalanceUSD * borrowRate))
   * @return Number
   */
  borrowTotalInterestOverAYear(): number {
    let allUsersBorrowSumRate = 0;
    if (this.persistenceService.allReserves) {
      Object.values(this.persistenceService.allReserves).forEach((reserve: ReserveData) => {
        allUsersBorrowSumRate += reserve.totalBorrowsUSD * reserve.borrowRate;
      });

      return allUsersBorrowSumRate;
    } else {
      throw new OmmError("getAllUsersBorrowSumRate -> this.persistenceService.allReserves is undefined");
    }
  }

  public votingPower(): number {
    const totalIcxStakedByOMM = this.persistenceService.getAssetReserveData(AssetTag.ICX)?.totalLiquidity ?? 0;
    const totalStakedOmm = this.persistenceService.totalStakedOmm;

    if (totalIcxStakedByOMM === 0 || totalStakedOmm === 0) {
      return 0;
    }

    const res = Utils.divideDecimalsPrecision(totalIcxStakedByOMM, totalStakedOmm);

    return Utils.roundDownTo2Decimals(Utils.convertSICXToICX(res, this.persistenceService.sIcxToIcxRate()));
  }

  public calculateAssetSupplySliderMax(assetTag: AssetTag): number {
    let suppliedAssetBalance = this.persistenceService.getUserSuppliedAssetBalance(assetTag);

    if (assetTag === AssetTag.ICX) {
      suppliedAssetBalance = Utils.convertSICXToICX(suppliedAssetBalance, this.persistenceService.sIcxToIcxRate());
    }

    return Utils.addDecimalsPrecision(suppliedAssetBalance, this.persistenceService.getUserAssetBalance(assetTag));
  }

  // calculate the total risk percentage based on the user health factor or user action
  public calculateTotalRisk(assetTag?: AssetTag, diff?: number, userAction?: UserAction, updateState = true): number {
    let res: number;
    if (assetTag && diff && userAction != null) {
      res = this.calculateTotalRiskDynamic(assetTag, diff, userAction);
    } else {
      res = this.calculateTotalRiskBasedOnHF();
    }

    if (updateState) {
      // update persistence user total risk
      this.stateChangeService.updateUserTotalRisk(res);
    }

    return res;
  }

  private calculateTotalRiskBasedOnHF(): number {
    // if user has not borrowed any asset return 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      return 0;
    } else {
      const healthFactor = this.persistenceService.userAccountData?.healthFactor ?? 1;

      // check for negative health factor
      if (healthFactor <= 0) {
        return 0;
      }

      const totalRiskPercentage = 1 / healthFactor;
      // log.debug("**********************************************");
      // log.debug(`${this.className} calculateTotalRiskBasedOnHF = ${totalRiskPercentage}`);
      return totalRiskPercentage;
    }
  }

  /**
   * @description Calculate the total risk based on the user action (supply, redeem, ..)
   * @param assetTag - Asset based on which we are calculating the risk
   * @param amount - Amount being considered in dynamic risk calculation
   * @param userAction - Action that user is making
   * @return total user risk as a number (multiply by 100 to get percentage)
   */
  private calculateTotalRiskDynamic(assetTag: AssetTag, amount: number, userAction: UserAction): number {
    // log.debug("*******************  calculateTotalRiskDynamic  ***************************");
    // log.debug(`Params: assetTag=${assetTag}, amount=${amount}, userAction=${userAction.toString()}`);

    const userAccountData = this.persistenceService.userAccountData;
    // if user account data not yet initialised return 0
    if (!userAccountData) {
      // log.debug("calculateValueRiskTotal userAccountData = undefined");
      return 0;
    }

    // init base values
    let totalFeeUSD = userAccountData.totalFeesUSD;
    let totalBorrowBalanceUSD = userAccountData.totalBorrowBalanceUSD;
    let totalCollateralBalanceUSD = userAccountData.totalCollateralBalanceUSD;
    const liquidationThreshold = this.persistenceService.getAverageLiquidationThreshold();


    // log.debug("Dynamic risk calculation....");
    const assetReserve = this.persistenceService.getAssetReserveData(assetTag);
    const assetExchangePrice = assetReserve?.exchangePrice ?? 0;

    switch (userAction) {
      case UserAction.SUPPLY:
        // log.debug(`amount being supplied=${amount} ${riskCalculationData.assetTag}`);

        // if user add more collateral, add USD value of amount to the total collateral balance USD
        totalCollateralBalanceUSD += amount * assetExchangePrice;
        break;
      case UserAction.REDEEM:
        // log.debug(`amount being redeemed=${amount} ${riskCalculationData.assetTag}`);
        // if user takes out collateral, subtract USD value of amount from the total collateral balance USD
        totalCollateralBalanceUSD -= amount * assetExchangePrice;
        break;
      case UserAction.BORROW:
        // if user takes out the loan (borrow) update the origination fee and add amount to the total borrow balance
        const originationFee = this.persistenceService.getUserAssetReserve(assetTag)?.originationFee ?? 0;
        const originationFeePercentage = this.persistenceService.loanOriginationFeePercentage ?? 0.001;
        // log.debug(`originationFee=${originationFee}`);
        // log.debug(`amount being borrowed=${amount} ${assetTag}`);
        totalFeeUSD += amount * assetExchangePrice * originationFeePercentage + originationFee;
        totalBorrowBalanceUSD += amount * assetExchangePrice;
        break;
      case UserAction.REPAY:
        // log.debug(`amount being repaid=${amount} ${riskCalculationData.assetTag}`);
        // if user repays the loan, subtract the USD value of amount from the total borrow balance USD
        totalBorrowBalanceUSD -= amount * assetExchangePrice;
    }


    // log.debug("Total risk percentage calculation:");
    // log.debug(`totalBorrowBalanceUSD=${totalBorrowBalanceUSD}`);
    // log.debug(`totalCollateralBalanceUSD=${totalCollateralBalanceUSD}`);
    // log.debug(`totalFeeUSD=${totalFeeUSD}`);
    // log.debug(`liquidationThreshold=${liquidationThreshold}`);

    let res = totalBorrowBalanceUSD / ((totalCollateralBalanceUSD - totalFeeUSD) * liquidationThreshold);

    if (res < 0) {
      res = 1;
    }

    // log.debug("Total dynamic risk = " + res);

    return res;
  }

  /**
   * @description Calculate the available borrow for specific asset (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return asset available borrow amount
   */
  public calculateAvailableBorrowForAsset(assetTag: AssetTag): number {
    // log.debug("**********************************************");
    // log.debug("calculateAvailableBorrowForAsset:");
    // average across all reserves
    const currentLTV = this.persistenceService.userAccountData?.currentLtv ?? 0;
    // log.debug("currentLTV:" + currentLTV);

    const totalCollateralBalanceUSD = this.persistenceService.userAccountData?.totalCollateralBalanceUSD ?? 0;
    // log.debug("totalCollateralBalanceUSD:" + totalCollateralBalanceUSD);

    const totalFeesUSD = this.persistenceService.userAccountData?.totalFeesUSD ?? 0;
    // log.debug("totalFeesUSD:" + totalFeesUSD);


    const borrowsAllowedUSD = (totalCollateralBalanceUSD - totalFeesUSD) * currentLTV;
    // log.debug("borrowsAllowedUSD:" + borrowsAllowedUSD);
    // previous borrow balance of user across all collaterals in USD
    const totalBorrowBalanceUSD = this.persistenceService.userAccountData?.totalBorrowBalanceUSD ?? 0;
    // log.debug("totalBorrowBalanceUSD:" + totalBorrowBalanceUSD);
    // the amount user can borrow in USD across all the collaterals
    const availableBorrowUSD = borrowsAllowedUSD - totalBorrowBalanceUSD;
    // log.debug("availableBorrowUSD:" + availableBorrowUSD);
    // exchange price of the asset (reserve) extracted from the ReserveData
    const exchangePrice = this.persistenceService.getAssetReserveData(assetTag)?.exchangePrice ?? 0.54321;
    // log.debug(`exchangePrice for ${assetTag} = ${exchangePrice}`);

    // return availableBorrowUSD / exchangePrice;
    let res = availableBorrowUSD / exchangePrice;

    if (assetTag === AssetTag.ICX) {
      // if asset is ICX converted calculated sICX max borrow in to ICX max borrow
      res = Utils.convertSICXToICX(res, this.persistenceService.sIcxToIcxRate());
    }

    // log.debug(`Available borrow for ${assetTag} is: availableBorrowUSD / exchangePrice = ${res}`);
    return Utils.roundDownTo2Decimals(res);
  }

  /**
   * @description Calculate users daily supply interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param supplied - optional parameter to provide current supplied value (e.g. for dynamic slider changes)
   * @return users asset supply interest (in USD) for a day
   */
  public calculateUsersDailySupplyInterestForAsset(assetTag: AssetTag, supplied?: number): number {
    // log.debug("**********************************************");
    // log.debug("Daily supply interest for reserve calculation:");

    let currentOTokenBalanceUSD = this.persistenceService.getUserSuppliedAssetUSDBalance(assetTag);
    // log.debug(`currentOTokenBalanceUSD=${currentOTokenBalanceUSD}`);

    const exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
    if (supplied) {
      currentOTokenBalanceUSD = supplied * exchangePrice;
      // log.debug(`amountBeingSupplied=${supplied}`);
      // log.debug(`exchangePrice=${exchangePrice}`);
      // log.debug(`after currentOTokenBalanceUSD=${currentOTokenBalanceUSD}`);
    }

    const liquidityRate = this.persistenceService.getUserAssetReserve(assetTag)?.liquidityRate ?? 0;
    // log.debug(`liquidityRate=${liquidityRate}`);
    // "easy route" formula
    const res = currentOTokenBalanceUSD * liquidityRate * (1 / 365);
    // log.debug(`Users daily supply interest, currentOTokenBalanceUSD * liquidityRate * (1 / 365) = ${res}`);

    // convert to asset
    return res / exchangePrice;
  }

  calculateUsersSupplyInterestPerDayUSD(): number {
    let total = 0;
    let exchangePrice = 0;

    Object.values(AssetTag).forEach(assetTag => {
      exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
      total += this.calculateUsersDailySupplyInterestForAsset(assetTag) * exchangePrice;
    });

    return total;
  }

  /**
   * @description Calculate users daily borrow interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param borrowed - optional parameter to provide current borrowed value (e.g. for dynamic slider changes)
   * @return users asset borrow interest (in USD) for a day
   */
  public calculateUsersDailyBorrowInterestForAsset(assetTag: AssetTag, borrowed?: number): number {
    let currentBorrowBalanceUSD = this.persistenceService.getUserBorrowedAssetUSDBalance(assetTag);
    const exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);

    if (borrowed) {
      currentBorrowBalanceUSD = borrowed * exchangePrice;
    }

    const borrowRate = this.persistenceService.getUserAssetReserve(assetTag)?.borrowRate ?? 0;

    // log.debug("**********************************************");
    // log.debug("Daily borrow interest for reserve calculation for :", assetTag);
    // log.debug(`currentBorrowBalanceUSD=${currentBorrowBalanceUSD}`);
    // log.debug(`borrowRate=${borrowRate}`);
    // "easy route" formula
    const res = currentBorrowBalanceUSD * borrowRate * (1 / 365);

    // convert to asset
    const valueInAsset = res / exchangePrice;
    // log.debug(`Result = ${valueInAsset} ${assetTag}`);

    return valueInAsset;
  }

  calculateUsersBorrowInterestPerDayUSD(): number {
    let total = 0;
    let exchangePrice = 0;

    // log.debug("******** calculateUsersBorrowInterestPerDayUSD ******");
    Object.values(AssetTag).forEach(assetTag => {
      // log.debug("assetTag = ", assetTag);
      exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
      // log.debug("exchangePrice = ", exchangePrice);
      total += this.calculateUsersDailyBorrowInterestForAsset(assetTag) * exchangePrice;
      // log.debug("this.calculateUsersDailyBorrowInterestForAsset(assetTag) = ", this.calculateUsersDailyBorrowInterestForAsset(assetTag));
    });

    return total;
  }

  public calculateUserTotalOmmRewards(): number {
    return this.calculateUsersOmmRewardsForDeposit() + this.calculateUsersOmmRewardsForBorrow();
  }

  /**
   * @description Calculate users OMM rewards for deposit of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param supplied - Optional parameter for dynamic calculations based on supply change (slider)
   * @return users Omm reward for deposit amount
   */
  public calculateUsersOmmRewardsForDeposit(assetTag?: AssetTag, supplied?: number): number {
    let userSum = 0;

    this.persistenceService.userReserves.reserveMap.forEach((reserve, tag) => {
      let collateralBalanceUSD = reserve?.currentOTokenBalanceUSD ?? 0;

      // dynamic calculation
      if (assetTag && supplied && assetTag === tag) {
        collateralBalanceUSD =  supplied * this.persistenceService.getAssetExchangePrice(assetTag);
      }

      const liquidityRate = reserve?.liquidityRate ?? 0;
      userSum += collateralBalanceUSD * liquidityRate;
    });

    if (!this.persistenceService.allReserves) { return 0; }

    let allUsersSum = 0;
    Object.values(this.persistenceService?.allReserves).forEach((reserve: ReserveData) => {
      allUsersSum += reserve.totalLiquidityUSD * reserve.liquidityRate;
    });


    // log.debug("**********************************:");
    // log.debug("calculateUsersOmmRewardsForDeposit:");
    // log.debug("userSum: ", userSum);
    // log.debug("allUsersSum: ", allUsersSum);

    if (userSum === 0 || allUsersSum === 0) { return 0; }

    return (userSum / allUsersSum) * 0.2 * this.persistenceService.tokenDistributionPerDay;
  }

  /**
   * @description Calculate users OMM rewards for borrow of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param borrowed - Optional parameter for dynamic calculations based on borrow change (slider)
   * @return users Omm reward for borrow amount
   */
  public calculateUsersOmmRewardsForBorrow(assetTag?: AssetTag, borrowed?: number): number {
    let userSum = 0;
    this.persistenceService.userReserves.reserveMap.forEach((reserve, tag) => {
      let borrowBalanceUSD = reserve?.currentBorrowBalanceUSD ?? 0;

      // dynamic calculation of borrow balance USD
      if (assetTag && borrowed && assetTag === tag) {
        const exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
        borrowBalanceUSD =  borrowed * exchangePrice;
      }

      const borrowRate = reserve?.borrowRate ?? 0;
      userSum += borrowBalanceUSD * borrowRate;
    });

    if (!this.persistenceService.allReserves) { return 0; }

    let allUsersSum = 0;
    Object.values(this.persistenceService?.allReserves).forEach((reserve: ReserveData) => {
      allUsersSum += reserve.totalBorrowsUSD * reserve.borrowRate;
    });

    if (userSum === 0 || allUsersSum === 0) { return 0; }

    return (userSum / allUsersSum) * 0.2 * this.persistenceService.tokenDistributionPerDay;
  }

  public getTotalAvgSupplyApy(ommApyIncluded = false): number {
    let totalLiquidityUSDsum = 0;
    let totalLiquidityUSDsupplyApySum = 0;

    if (!this.persistenceService.allReserves) {
      return 0;
    }

    let reserve: ReserveData | undefined;
    Object.values(AssetTag).forEach((assetTag: AssetTag) => {
      reserve = this.persistenceService.allReserves!.getReserveData(assetTag);
      totalLiquidityUSDsum += reserve.totalLiquidityUSD;
      const rate = ommApyIncluded ? reserve.liquidityRate + this.calculateSupplyApyWithOmmRewards(assetTag) : reserve.liquidityRate;
      totalLiquidityUSDsupplyApySum += reserve.totalLiquidityUSD * rate;
    });

    return totalLiquidityUSDsupplyApySum / totalLiquidityUSDsum;
  }

  public getTotalAvgBorrowApy(ommApyIncluded = false): number {
    let totalBorrowUSDsum = 0;
    let totalBorrowUSDsupplyApySum = 0;

    if (!this.persistenceService.allReserves) {
      return 0;
    }

    let reserve: ReserveData | undefined;
    Object.values(AssetTag).forEach((assetTag: AssetTag) => {
      reserve = this.persistenceService.allReserves!.getReserveData(assetTag);
      const rate = ommApyIncluded ? reserve.borrowRate + this.calculateBorrowApyWithOmmRewards(assetTag) : reserve.borrowRate;
      totalBorrowUSDsum += reserve.totalBorrowsUSD;
      totalBorrowUSDsupplyApySum += reserve.totalBorrowsUSD * rate;
    });

    return totalBorrowUSDsupplyApySum / totalBorrowUSDsum;
  }

  // Formulae: User Liquidity Amount in USD * (Supply APY + OMM reward Supply APY) / User Liquidity in USD
  public getUserAssetSupplyApy(assetTag: AssetTag, ommApyIncluded = false): number {
    if (ommApyIncluded) {
      const userLiquidityAmountUSD = this.persistenceService.getUserAssetReserve(assetTag)?.currentOTokenBalanceUSD ?? 0;
      const supplyApy = this.persistenceService.getUserAssetReserve(assetTag)?.liquidityRate ?? 0;
      const ommRewardsSupplyApy = this.calculateSupplyApyWithOmmRewards(assetTag);

      return (userLiquidityAmountUSD * (supplyApy + ommRewardsSupplyApy)) / userLiquidityAmountUSD;
    } else {
      return this.persistenceService.getUserAssetReserve(assetTag)?.liquidityRate ?? 0;
    }
  }

  // Formulae: User Borrows Amount in USD * (Borrow APY + OMM reward Supply APY) / User Borrows in USD
  public getUserAssetBorrowApy(assetTag: AssetTag, ommApyIncluded = false): number {
    if (ommApyIncluded) {
      const userBorrowsAmountUSD = this.persistenceService.getUserAssetReserve(assetTag)?.currentBorrowBalanceUSD ?? 0;
      const borrowApy = this.persistenceService.getUserAssetReserve(assetTag)?.borrowRate ?? 0;
      const ommRewardsBorrowApy = this.calculateBorrowApyWithOmmRewards(assetTag);

      // console.log("userBorrowsAmountUSD=" + userBorrowsAmountUSD);
      // console.log("borrowApy=" + userBorrowsAmountUSD);
      // console.log("ommRewardsBorrowApy=" + userBorrowsAmountUSD);

      return (userBorrowsAmountUSD * (borrowApy + ommRewardsBorrowApy)) / userBorrowsAmountUSD;
    } else {
      return this.persistenceService.getUserAssetReserve(assetTag)?.borrowRate ?? 0;
    }
  }

  public getYourSupplyApy(ommApyIncluded = false): number {
    let supplyApySum = 0;
    let supplySum = 0;
    let supplied;
    let supplyApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.persistenceService.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined, assetTag: AssetTag) => {
      supplied = reserve?.currentOTokenBalanceUSD ?? 0;
      supplyApy = reserve?.liquidityRate ?? 0;
      const rate = ommApyIncluded ? supplyApy + this.calculateSupplyApyWithOmmRewards(assetTag) : supplyApy;
      supplyApySum += supplied * rate;
      supplySum += supplied;
    });

    return supplyApySum / supplySum;
  }

  public getYourBorrowApy(ommApyIncluded = false): number {
    let borrowApySum = 0;
    let borrowSum = 0;
    let borrowed;
    let borrowApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.persistenceService.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined, assetTag: AssetTag) => {
      borrowed = reserve?.currentBorrowBalanceUSD ?? 0;
      borrowApy = reserve?.borrowRate ?? 0;
      const rate = ommApyIncluded ? borrowApy + this.calculateBorrowApyWithOmmRewards(assetTag) : borrowApy;
      borrowApySum += borrowed * rate;
      borrowSum += borrowed;
    });

    return borrowApySum / borrowSum;
  }

  public calculatePrepsIcxReward(prep: Prep, prepList: PrepList): number {
    const blockValidationRewards = prep.irep / 2;

    const delegationRate = prep.delegated / prepList.totalDelegated;

    const representativeRewards = prep.irep / 2 * 100 * delegationRate;

    return blockValidationRewards + representativeRewards;
  }

}
