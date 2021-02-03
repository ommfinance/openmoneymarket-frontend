import {Injectable} from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag} from "../../models/Asset";
import log from "loglevel";
import {RiskCalculationData} from "../../models/RiskCalculationData";
import {UserAction} from "../../models/UserAction";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {
  className = "[CalculationsService]";

  constructor(private persistenceService: PersistenceService) { }

  public calculateAssetSliderAvailableSupply(currentAssetSupplied: number, assetTag: AssetTag): number {
    return (this.persistenceService.activeWallet?.balances.get(assetTag) ?? 0) +
      ((this.persistenceService.getUserSuppliedAssetBalance(assetTag)) - currentAssetSupplied);
  }

  public calculateAssetSupplySliderMax(assetTag: AssetTag): number {
    return this.persistenceService.getUserSuppliedAssetBalance(assetTag) + this.persistenceService.getUserAssetBalance(assetTag);
  }

  // calculate the total risk percentage based on the user health factor or user action
  public calculateTotalRiskPercentage(riskCalculationData?: RiskCalculationData): number {
    if (riskCalculationData) {
      return this.calculateValueRiskTotal(riskCalculationData);
    } else {
      return this.calculateTotalRiskPercentageBasedOnHF();
    }
  }

  private calculateTotalRiskPercentageBasedOnHF(): number {
    // if user has not borrowed any asset return 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      return 0;
    } else {
      const healthFactor = this.persistenceService.userAccountData?.healthFactor ?? 1;

      // check for negative health factor
      if (healthFactor <= 0) {
        return 0;
      }

      const totalRiskPercentage = 1 / healthFactor * 100;
      log.debug("**********************************************");
      log.debug(`${this.className} calculateTotalRiskPercentage-> healthFactor = ${this.persistenceService.userAccountData?.healthFactor}`);
      log.debug(`${this.className} calculateTotalRiskPercentage-> totalRiskPercentage = ${totalRiskPercentage}`);
      return totalRiskPercentage;
    }
  }

  /**
   * @description Calculate the total risk based on the user action (supply, redeem, ..)
   * @param riskCalculationData - Optional data containing the values needed to dynamically calculate total risk
   * @return total user risk as a number in percentage
   */
  private calculateValueRiskTotal(riskCalculationData?: RiskCalculationData): number {
    log.debug(riskCalculationData);

    const userAccountData = this.persistenceService.userAccountData;
    // if user account data not yet initialised return 0
    if (!userAccountData) {
      log.debug("calculateValueRiskTotal userAccountData = undefined");
      return 0;
    }

    // init base values
    let totalFeeUSD = userAccountData.totalFeesUSD;
    let totalBorrowBalanceUSD = userAccountData.totalBorrowBalanceUSD;
    let totalCollateralBalanceUSD = userAccountData.totalCollateralBalanceUSD;
    const liquidationThreshold = this.persistenceService.getAverageLiquidationThreshold();

    // if the user action trigger re-calculation of the risk, dynamically adjust the base values based on action
    if (riskCalculationData) {
      const amount = riskCalculationData.amount;
      const assetTag = riskCalculationData.assetTag;
      const assetReserve = this.persistenceService.getAssetReserveData(assetTag);
      const assetExchangePrice = assetReserve?.exchangePrice ?? 0;

      switch (riskCalculationData.action) {
        case UserAction.SUPPLY:
          // if user add more collateral, add USD value of amount to the total collateral balance USD
          totalCollateralBalanceUSD += amount * assetExchangePrice;
          break;
        case UserAction.REDEEM:
          // if user takes out collateral, subtract USD value of amount from the total collateral balance USD
          totalCollateralBalanceUSD -= amount * assetExchangePrice;
          break;
        case UserAction.BORROW:
          // if user takes out the loan (borrow) update the origination fee and add amount to the total borrow balance
          const originationFee = this.persistenceService.getUserAssetReserve(riskCalculationData.assetTag)?.originationFee ?? 0;
          totalFeeUSD += (amount * assetExchangePrice) * originationFee / 100;
          totalBorrowBalanceUSD += amount * assetExchangePrice;
          break;
        case UserAction.REPAY:
          // if user repays the loan, subtract the USD value of amount from the total borrow balance USD
          totalBorrowBalanceUSD -= amount * assetExchangePrice;
      }
    }
    log.debug("**********************************************");
    log.debug("Total risk percentage calculation:");
    log.debug(`totalBorrowBalanceUSD=${totalBorrowBalanceUSD}`);
    log.debug(`totalCollateralBalanceUSD=${totalCollateralBalanceUSD}`);
    log.debug(`totalFeeUSD=${totalFeeUSD}`);
    log.debug(`liquidationThreshold=${liquidationThreshold}`);
    return (totalBorrowBalanceUSD / (totalCollateralBalanceUSD - totalFeeUSD) * liquidationThreshold) * 100;
  }

  /**
   * @description Calculate the available borrow for specific asset (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return asset available borrow amount
   */
  public calculateAvailableBorrowForAsset(assetTag: AssetTag): number {
    log.debug("**********************************************");
    log.debug("calculateAvailableBorrowForAsset:");
    // average across all reserves
    const currentLTV = this.persistenceService.userAccountData?.currentLtv ?? 0;
    log.debug("currentLTV:" + currentLTV);

    const totalCollateralBalanceUSD = this.persistenceService.userAccountData?.totalCollateralBalanceUSD ?? 0;
    log.debug("totalCollateralBalanceUSD:" + totalCollateralBalanceUSD);

    const totalFeesUSD = this.persistenceService.userAccountData?.totalFeesUSD ?? 0;
    log.debug("totalFeesUSD:" + totalFeesUSD);


    const borrowsAllowedUSD = (totalCollateralBalanceUSD - totalFeesUSD) * currentLTV;
    log.debug("borrowsAllowedUSD:" + borrowsAllowedUSD);
    // previous borrow balance of user across all collaterals in USD
    const totalBorrowBalanceUSD = this.persistenceService.userAccountData?.totalBorrowBalanceUSD ?? 0;
    log.debug("totalBorrowBalanceUSD:" + totalBorrowBalanceUSD);
    // the amount user can borrow in USD across all the collaterals
    const availableBorrowUSD = borrowsAllowedUSD - totalBorrowBalanceUSD;
    log.debug("availableBorrowUSD:" + availableBorrowUSD);
    // exchange price of the asset (reserve) extracted from the ReserveData
    const exchangePrice = this.persistenceService.getAssetReserveData(assetTag)?.exchangePrice ?? 0.54321;
    log.debug(`exchangePrice for ${assetTag} = ${exchangePrice}`);

    // return availableBorrowUSD / exchangePrice;
    return availableBorrowUSD / exchangePrice;
  }

  /**
   * @description Calculate users daily supply interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param amountBeingSupplied - optional parameter to provide current supplied value (e.g. for dynamic slider changes)
   * @return users asset supply interest (in USD) for a day
   */
  public calculateUsersDailySupplyInterestForAsset(assetTag: AssetTag, amountBeingSupplied?: number): number {
    let currentOTokenBalanceUSD = this.persistenceService.getUserSuppliedAssetUSDBalance(assetTag);

    if (amountBeingSupplied) {
      // multiply supplied with the price of asset to get USD value
      currentOTokenBalanceUSD += amountBeingSupplied * this.persistenceService.getAssetExchangePrice(assetTag);
    }

    const liquidityRate = this.persistenceService.getUserAssetReserve(assetTag)?.liquidityRate ?? 0;

    // log.debug("**********************************************");
    // log.debug("Daily supply interest for reserve calculation:");
    // log.debug(`currentOTokenBalanceUSD=${currentOTokenBalanceUSD}`);
    // log.debug(`liquidityRate=${liquidityRate}`);
    // "easy route" formula
    return currentOTokenBalanceUSD * liquidityRate * (1 / 365);
  }

  calculateUsersAverageDailySupplyInterest(): number {
    let counter = 0;
    let total = 0;

    Object.values(AssetTag).forEach(assetTag => {
      total += this.calculateUsersDailySupplyInterestForAsset(assetTag);
      counter++;
    });

    return total / counter;
  }

  /**
   * @description Calculate users daily borrow interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param amountBeingBorrowed - optional parameter to provide current borrowed value (e.g. for dynamic slider changes)
   * @return users asset borrow interest (in USD) for a day
   */
  public calculateUsersDailyBorrowInterestForAsset(assetTag: AssetTag, amountBeingBorrowed?: number): number {
    let currentBorrowBalanceUSD = this.persistenceService.getUserBorrowedAssetUSDBalance(assetTag);

    if (amountBeingBorrowed) {
      currentBorrowBalanceUSD += amountBeingBorrowed * this.persistenceService.getAssetExchangePrice(assetTag);
    }

    const borrowRate = this.persistenceService.getUserAssetReserve(assetTag)?.borrowRate ?? 0;

    // log.debug("**********************************************");
    // log.debug("Daily borrow interest for reserve calculation:");
    // log.debug(`currentBorrowBalanceUSD=${currentBorrowBalanceUSD}`);
    // log.debug(`borrowRate=${borrowRate}`);
    // "easy route" formula
    return currentBorrowBalanceUSD * borrowRate * (1 / 365);
  }

  calculateUsersAverageDailyBorrowInterest(): number {
    let counter = 0;
    let total = 0;

    Object.values(AssetTag).forEach(assetTag => {
      total += this.calculateUsersDailyBorrowInterestForAsset(assetTag);
      counter++;
    });

    return total / counter;
  }

  /**
   * @description Calculate users OMM rewards for deposit of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return users Omm reward for deposit amount
   */
  public calculateUsersOmmRewardsForDeposit(assetTag: AssetTag): number {
    // TODO clear out that part
    return -1;
  }

  /**
   * @description Calculate users OMM rewards for borrow of specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return users Omm reward for borrow amount
   */
  public calculateUsersOmmRewardsForBorrow(assetTag: AssetTag): number {
    // TODO clear out that part
    return -1;
  }

}
