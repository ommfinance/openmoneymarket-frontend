import {Injectable} from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {AssetTag, CollateralAssetTag} from "../../models/Asset";
import {UserAction} from "../../models/UserAction";
import {ReserveData} from "../../models/AllReservesData";
import {StateChangeService} from "../state-change/state-change.service";
import {Utils} from "../../common/utils";
import {Prep, PrepList} from "../../models/Preps";
import {OmmError} from "../../core/errors/OmmError";
import {UserReserveData} from "../../models/UserReserveData";
import log from "loglevel";
import {PoolData} from "../../models/PoolData";
import {UserPoolData} from "../../models/UserPoolData";
import BigNumber from "bignumber.js";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class CalculationsService {

  constructor(private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService) { }


  // formulae: Supply APY + OMM reward Supply APY
  calculateUserAndMarketReserveSupplyApy(assetTag: AssetTag): BigNumber {
    const reserveData = this.persistenceService.getAssetReserveData(assetTag);

    if (reserveData) {
      return reserveData.liquidityRate.plus(this.calculateSupplyApyWithOmmRewards(assetTag));
    } else {
      return new BigNumber("0");
    }
  }

  // formulae: OMM reward Borrow APY - Borrow APY
  calculateUserAndMarketReserveBorrowApy(assetTag: AssetTag): BigNumber {
    const reserveData = this.persistenceService.getAssetReserveData(assetTag);

    if (reserveData) {
      return this.calculateBorrowApyWithOmmRewards(assetTag).minus(reserveData.borrowRate);
    } else {
      return new BigNumber("0");
    }
  }

  public calculateBorrowApyWithOmmRewards(assetTag: AssetTag): BigNumber {
    const reserveData = this.persistenceService.getAssetReserveData(assetTag);

    if (reserveData) {
      const dailyBorrowRewards = this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.getDailyBorrowRewardsForReserve(assetTag)
        ?? new BigNumber("0");
      return this.borrowOmmApyFormula(dailyBorrowRewards, this.persistenceService.ommPriceUSD, reserveData, assetTag);
    } else {
      return new BigNumber("0");
    }
  }

  // Borrow OMM rewards APY: Token Distribution for that day (1M) * OMM Token Price * reserve portion * reserve borrowing * 365
  // / (reserve supplied * reserve price from Oracle)
  public borrowOmmApyFormula(dailyReserveBorrowRewards: BigNumber, ommPriceUSD: BigNumber, reserveData: ReserveData,
                             assetTag: AssetTag): BigNumber {
    // if reserve is ICX, convert ICX exchange price to sICX
    const exchangePrice = assetTag === AssetTag.ICX ? Utils.convertICXToSICXPrice(reserveData.exchangePrice, reserveData.sICXRate)
      : reserveData.exchangePrice;

    log.debug("Exchange price = " + exchangePrice);

    return (dailyReserveBorrowRewards.multipliedBy(ommPriceUSD).multipliedBy(365)).dividedBy((reserveData.totalBorrows
      .multipliedBy(exchangePrice)));
  }

  public calculateSupplyApyWithOmmRewards(assetTag: AssetTag): BigNumber {
    const reserveData = this.persistenceService.getAssetReserveData(assetTag);

    if (reserveData) {
      const dailySupplyRewards = this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.getDailySupplyRewardsForReserve(assetTag)
        ?? new BigNumber("0");
      return this.supplyOmmApyFormula(dailySupplyRewards, this.persistenceService.ommPriceUSD, reserveData, assetTag);
    } else {
      log.debug("calculateSupplyApyWithOmmRewards: res is ZERO (reserveData not found)");
      return new BigNumber("0");
    }
  }

  public supplyOmmApyFormula(dailySupplyRewards: BigNumber, ommPriceUSD: BigNumber, reserveData: ReserveData,
                             assetTag: AssetTag): BigNumber {
    // if reserve is ICX, convert ICX exchange price to sICX
    const exchangePrice = assetTag === AssetTag.ICX ? Utils.convertICXToSICXPrice(reserveData.exchangePrice, reserveData.sICXRate)
      : reserveData.exchangePrice;

    return (dailySupplyRewards.multipliedBy(ommPriceUSD).multipliedBy(new BigNumber("365"))).dividedBy(reserveData.totalLiquidity
      .multipliedBy(exchangePrice));
  }

  /**
   * @description sum(sum(CollateralBalanceUSD * liquidityRate)) for all users
   * @return Number
   */
  public supplyTotalInterestOverAYear(): BigNumber {
    let allUsersCollateralSumRate = new BigNumber("0");

    if (this.persistenceService.allReserves) {
      Object.values(this.persistenceService.allReserves).forEach((reserve: ReserveData) => {
        allUsersCollateralSumRate = allUsersCollateralSumRate.plus(reserve.totalLiquidityUSD.multipliedBy(reserve.liquidityRate));
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
  borrowTotalInterestOverAYear(): BigNumber {
    let allUsersBorrowSumRate = new BigNumber("0");
    if (this.persistenceService.allReserves) {
      Object.values(this.persistenceService.allReserves).forEach((reserve: ReserveData) => {
        allUsersBorrowSumRate = allUsersBorrowSumRate.plus(reserve.totalBorrowsUSD.multipliedBy(reserve.borrowRate));
      });

      return allUsersBorrowSumRate;
    } else {
      throw new OmmError("getAllUsersBorrowSumRate -> this.persistenceService.allReserves is undefined");
    }
  }

  /** Formulae: Omm's Voting Power/Total staked OMM tokens */
  public votingPower(): BigNumber {
    const ommVotingPower = this.ommVotingPower();
    const totalStakedOmm = this.persistenceService.totalStakedOmm;

    if (ommVotingPower.isZero() || totalStakedOmm.isZero()) {
      return new BigNumber("0");
    }

    return Utils.divide(ommVotingPower, totalStakedOmm).dp(2);
  }

  /** (totalLiquidity of sICX - totalborrow of sICX) * (sICX/ICX ratio) */
  public ommVotingPower(): BigNumber {
    const totalLiquiditySicx = this.persistenceService.getAssetReserveData(AssetTag.ICX)?.totalLiquidity ?? new BigNumber("0");
    const totalborrowSicx = this.persistenceService.getAssetReserveData(AssetTag.ICX)?.totalBorrows ?? new BigNumber("0");
    const sIcxIcxRatio = this.persistenceService.sIcxToIcxRate();

    return ((totalLiquiditySicx.minus(totalborrowSicx)).multipliedBy(sIcxIcxRatio)).dp(2);
  }

  /** Formulae: Omm's Voting Power/Total staked OMM tokens * user’s staked OMM token */
  public usersVotingPower(): BigNumber {
    const ommVotingPower = this.ommVotingPower();
    const totalStakedOmm = this.persistenceService.totalStakedOmm;
    const userStakedOmmToken = this.persistenceService.getUsersStakedOmmBalance();

    return (ommVotingPower.dividedBy(totalStakedOmm).multipliedBy(userStakedOmmToken)).dp(2);
  }

  public calculateAssetSupplySliderMax(assetTag: AssetTag): BigNumber {
    let suppliedAssetBalance = this.persistenceService.getUserSuppliedAssetBalance(assetTag);

    if (assetTag === AssetTag.ICX) {
      suppliedAssetBalance = Utils.convertSICXToICX(suppliedAssetBalance, this.persistenceService.sIcxToIcxRate());
    }

    return Utils.add(suppliedAssetBalance, this.persistenceService.getUserAssetBalance(assetTag));
  }

  // calculate the total risk percentage based on the user health factor or user action
  public calculateTotalRisk(assetTag?: AssetTag, diff?: BigNumber, userAction?: UserAction, updateState = true): BigNumber {

    let res: BigNumber;
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

  private calculateTotalRiskBasedOnHF(): BigNumber {
    // if user has not borrowed any asset return 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      return new BigNumber("0");
    } else {
      const healthFactor = this.persistenceService.userAccountData?.healthFactor ?? new BigNumber("1");
      log.debug(`healthFactor = ${healthFactor}`);

      // check for negative health factor
      if (healthFactor.isLessThanOrEqualTo(Utils.ZERO)) {
        return new BigNumber("0");
      }

      return new BigNumber("1").dividedBy(healthFactor);
    }
  }

  /**
   * @description Calculate the total risk based on the user action (supply, redeem, ..)
   * @param assetTag - Asset based on which we are calculating the risk
   * @param amount - Amount being considered in dynamic risk calculation
   * @param userAction - Action that user is making
   * @return total user risk as a number (multiply by 100 to get percentage)
   */
  private calculateTotalRiskDynamic(assetTag: AssetTag, amount: BigNumber, userAction: UserAction): BigNumber {
    const userAccountData = this.persistenceService.userAccountData;
    // if user account data not yet initialised return 0
    if (!userAccountData) {
      return new BigNumber("0");
    }

    // init base values
    let totalFeeUSD = userAccountData.totalFeesUSD;
    let totalBorrowBalanceUSD = userAccountData.totalBorrowBalanceUSD;
    let totalCollateralBalanceUSD = userAccountData.totalCollateralBalanceUSD;

    const liquidationThreshold = this.persistenceService.getAverageLiquidationThreshold();

    const assetReserve = this.persistenceService.getAssetReserveData(assetTag);
    let assetExchangePrice = assetReserve?.exchangePrice ?? new BigNumber("0");

    if (assetTag === AssetTag.ICX) {
      assetExchangePrice = Utils.convertICXToSICXPrice(assetExchangePrice, this.persistenceService.sIcxToIcxRate());
    }

    switch (userAction) {
      case UserAction.SUPPLY:
        // if user add more collateral, add USD value of amount to the total collateral balance USD
        if (assetReserve?.usageAsCollateralEnabled) {
          totalCollateralBalanceUSD = totalCollateralBalanceUSD.plus(amount.multipliedBy(assetExchangePrice));
        }
        break;
      case UserAction.REDEEM:
        // if user takes out collateral, subtract USD value of amount from the total collateral balance USD
        if (assetReserve?.usageAsCollateralEnabled) {
          totalCollateralBalanceUSD = totalCollateralBalanceUSD.minus(amount.multipliedBy(assetExchangePrice));
        }
        break;
      case UserAction.BORROW:
        // if user takes out the loan (borrow) update the origination fee and add amount to the total borrow balance
        const originationFeePercentage = this.persistenceService.loanOriginationFeePercentage ?? new BigNumber("0.001");
        totalFeeUSD = totalFeeUSD.plus(amount.multipliedBy(assetExchangePrice).multipliedBy(originationFeePercentage));
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.plus(amount.multipliedBy(assetExchangePrice));
        break;
      case UserAction.REPAY:
        // if user repays the loan, subtract the USD value of amount from the total borrow balance USD
        totalBorrowBalanceUSD = totalBorrowBalanceUSD.minus(amount.multipliedBy(assetExchangePrice));
    }

    let res = (new BigNumber("1")).dividedBy(this.calculateHealthFactor(totalCollateralBalanceUSD, totalBorrowBalanceUSD, totalFeeUSD,
      liquidationThreshold));

    if (res.isLessThan(Utils.ZERO)) {
      res = new BigNumber("0");
    }

    return res;
  }

  public calculateHealthFactor(totalCollateralUSD: BigNumber, totalBorrowUSD: BigNumber, totalFeeUSD: BigNumber,
                               averageLiquidationThreshold: BigNumber)
    : BigNumber {
    return ((totalCollateralUSD.minus(totalFeeUSD)).multipliedBy(averageLiquidationThreshold)).dividedBy(totalBorrowUSD);
  }

  /**
   * @description Calculate the available borrow for specific asset (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @return asset available borrow amount
   */
  public calculateAvailableBorrowForAsset(assetTag: AssetTag): BigNumber {
    if (assetTag === AssetTag.ICX) {
      return new BigNumber("0");
    }

    // Formulae: borrowsAllowedUSD = Sum((CollateralBalanceUSD per reserve - totalFeesUSD per reserve) * LTV per reserve)
    let borrowsAllowedUSD = new BigNumber("0");

    this.persistenceService.userReserves.reserveMap.forEach((userReserveData, tag) => {
      if (userReserveData) {
        const collateralBalanceUSD = userReserveData.currentOTokenBalanceUSD;
        const originationFee = userReserveData.originationFee;
        const ltv = this.persistenceService.getReserveLtv(tag);

        let assetExchangePrice = userReserveData?.exchangeRate;
        if (tag === AssetTag.ICX) {
          assetExchangePrice = Utils.convertICXToSICXPrice(assetExchangePrice, this.persistenceService.sIcxToIcxRate());
        }

        const totalReserveFeesUSD = originationFee.multipliedBy(assetExchangePrice);

        borrowsAllowedUSD = borrowsAllowedUSD.plus((collateralBalanceUSD.minus(totalReserveFeesUSD)).multipliedBy(ltv));
      }
    });

    // previous borrow balance of user across all collaterals in USD
    const totalBorrowBalanceUSD = this.persistenceService.userAccountData?.totalBorrowBalanceUSD ?? new BigNumber("0");

    // the amount user can borrow in USD across all the collaterals
    const availableBorrowUSD = borrowsAllowedUSD.minus(totalBorrowBalanceUSD);

    // exchange price of the asset (reserve) extracted from the ReserveData
    let exchangePrice = this.persistenceService.getAssetReserveData(assetTag)?.exchangePrice ?? new BigNumber("-1");
    if (assetTag === AssetTag.ICX) {
      exchangePrice = Utils.convertICXToSICXPrice(exchangePrice, this.persistenceService.sIcxToIcxRate());
    }

    const buffer = new BigNumber("0.9996");
    return (availableBorrowUSD.dividedBy(exchangePrice)).multipliedBy(buffer).dp(2);
  }

  /**
   * @description Calculate users daily supply interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param supplied - optional parameter to provide current supplied value (e.g. for dynamic slider changes)
   * @return users asset supply interest (in USD) for a day
   */
  public calculateUsersDailySupplyInterestForAsset(assetTag: AssetTag | CollateralAssetTag, supplied?: BigNumber): BigNumber {
    let currentOTokenBalanceUSD = this.persistenceService.getUserSuppliedAssetUSDBalance(assetTag);

    const exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);

    if (supplied) {
      currentOTokenBalanceUSD = supplied.multipliedBy(exchangePrice);
    }

    const liquidityRate = this.persistenceService.getUserAssetReserveLiquidityRate(assetTag);

    // "easy route" formula
    const res = currentOTokenBalanceUSD.multipliedBy(liquidityRate).multipliedBy(new BigNumber("1").dividedBy(new BigNumber("365")));

    // convert to asset
    return res.dividedBy(exchangePrice);
  }

  calculateUsersSupplyInterestPerDayUSD(): BigNumber {
    let total = new BigNumber("0");
    let exchangePrice = new BigNumber("0");

    Object.values(AssetTag).forEach(assetTag => {
      exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
      total = total.plus(this.calculateUsersDailySupplyInterestForAsset(assetTag).multipliedBy(exchangePrice));
    });

    return total;
  }

  /**
   * @description Calculate users daily borrow interest for specific asset - reserve (e.g. USDb, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param borrowed - optional parameter to provide current borrowed value (e.g. for dynamic slider changes)
   * @return users asset borrow interest (in USD) for a day
   */
  public calculateUsersDailyBorrowInterestForAsset(assetTag: AssetTag, borrowed?: BigNumber): BigNumber {
    let currentBorrowBalanceUSD = this.persistenceService.getUserBorrowedAssetUSDBalance(assetTag);
    const exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);

    if (borrowed) {
      currentBorrowBalanceUSD = borrowed.multipliedBy(exchangePrice);
    }

    const borrowRate = this.persistenceService.getUserAssetReserve(assetTag)?.borrowRate ?? 0;

    // "easy route" formula
    const res = currentBorrowBalanceUSD.multipliedBy(borrowRate).multipliedBy(new BigNumber("1").dividedBy(new BigNumber("365")));

    // convert to asset
    return res.dividedBy(exchangePrice);
  }

  calculateUsersBorrowInterestPerDayUSD(): BigNumber {
    let total = new BigNumber("0");
    let exchangePrice = new BigNumber("0");

    Object.values(AssetTag).forEach(assetTag => {
      exchangePrice = this.persistenceService.getAssetExchangePrice(assetTag);
      total = total.plus(this.calculateUsersDailyBorrowInterestForAsset(assetTag).multipliedBy(exchangePrice));
    });

    return total;
  }

  public calculateUserTotalOmmRewards(): BigNumber {
    let res = new BigNumber("0");
    Object.values(AssetTag).forEach(assetTag => {
      res = res.plus(this.calculateUserDailySupplyOmmReward(assetTag).plus(this.calculateUserDailyBorrowOmmReward(assetTag)));
    });
    return res;
  }

  /**
   * @description Calculate users OMM rewards for supply of specific asset - reserve (e.g. USDS, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param supplied - Optional parameter for dynamic calculations based on supplied change (slider)
   */
  public calculateUserDailySupplyOmmReward(assetTag: AssetTag | CollateralAssetTag, supplied?: BigNumber): BigNumber {
    if (supplied && assetTag === AssetTag.ICX) {
      supplied = Utils.convertICXTosICX(supplied, this.persistenceService.sIcxToIcxRate());
    }

    const reserveData = this.persistenceService.getAssetReserveData(assetTag);
    const userReserveData = this.persistenceService.getUserAssetReserve(assetTag);

    if (reserveData && userReserveData) {
      const dailySupplyRewards = this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.getDailySupplyRewardsForReserve(assetTag)
        ?? new BigNumber("0");

      return this.userSupplyOmmRewardsFormula(dailySupplyRewards, reserveData, userReserveData, supplied);
    } else {
      return new BigNumber("0");
    }
  }

  // Lending/Borrowing Portion (0.1) * Token Distribution for that day (1M) * reserve portion (0.4)
  // * reserve Lending (0.5) * User's reserve supplied balance/Total reserve supplied balance)
  public userSupplyOmmRewardsFormula(dailySupplyRewards: BigNumber, reserveData: ReserveData, userReserveData: UserReserveData,
                                     supplied?: BigNumber): BigNumber {
    // check if is dynamic supply value or not
    const amountBeingSupplied = supplied ? supplied : userReserveData.currentOTokenBalance;

    // if it is a dynamic supply amount add it to the total liquidity and subtract the current supplied
    const totalReserveLiquidity = supplied ? supplied.plus(reserveData.totalLiquidity).minus(userReserveData.currentOTokenBalance)
      : reserveData.totalLiquidity;
    return dailySupplyRewards.multipliedBy(amountBeingSupplied).dividedBy(totalReserveLiquidity);
  }

  /**
   * @description Calculate users OMM rewards for borrow of specific asset - reserve (e.g. USDS, ICX, ..)
   * @param assetTag - Tag (ticker) of the asset
   * @param borrowed - Optional parameter for dynamic calculations based on borrow change (slider)
   */
  public calculateUserDailyBorrowOmmReward(assetTag: AssetTag, borrowed?: BigNumber): BigNumber {
    const reserveData = this.persistenceService.getAssetReserveData(assetTag);
    const userReserveData = this.persistenceService.getUserAssetReserve(assetTag);

    if (reserveData && userReserveData) {
      const dailyBorrowRewards = this.persistenceService.dailyRewardsAllPoolsReserves?.reserve.getDailyBorrowRewardsForReserve(assetTag)
        ?? new BigNumber("0");
      return this.userBorrowOmmRewardsFormula(dailyBorrowRewards, reserveData, userReserveData, borrowed);
    } else {
      return new BigNumber("0");
    }
  }

  // Lending/Borrowing Portion (0.1) * Token Distribution for that day (1M) * reserve portion (0.4)
  // * reserve Borrowing (0.5) * User's reserve borrowd balance/Total reserve borrowed balance)
  public userBorrowOmmRewardsFormula(dailyBorrowRewards: BigNumber, reserveData: ReserveData, userReserveData: UserReserveData,
                                     borrowed?: BigNumber): BigNumber {
    // check if is dynamic borrow value or not
    const amountBeingBorrowed = borrowed ? borrowed : userReserveData.currentBorrowBalance;

    // if it is a dynamic borrow amount add it to the total liquidity and subtract the current borrowed
    const totalReserveBorrowed = borrowed ? borrowed.plus(reserveData.totalBorrows).minus(userReserveData.currentBorrowBalance)
      : reserveData.totalBorrows;

    return dailyBorrowRewards.multipliedBy(amountBeingBorrowed).dividedBy(totalReserveBorrowed);
  }

  public getTotalAvgSupplyApy(ommApyIncluded = false): BigNumber {
    let totalLiquidityUSDsum = new BigNumber("0");
    let totalLiquidityUSDsupplyApySum = new BigNumber("0");

    if (!this.persistenceService.allReserves) {
      return new BigNumber("0");
    }

    let reserve: ReserveData | undefined;
    Object.values(AssetTag).forEach((assetTag: AssetTag) => {
      reserve = this.persistenceService.allReserves!.getReserveData(assetTag);
      totalLiquidityUSDsum = totalLiquidityUSDsum.plus(reserve.totalLiquidityUSD);
      const rate = ommApyIncluded ? reserve.liquidityRate.plus(this.calculateSupplyApyWithOmmRewards(assetTag)) : reserve.liquidityRate;
      totalLiquidityUSDsupplyApySum = totalLiquidityUSDsupplyApySum.plus(reserve.totalLiquidityUSD.multipliedBy(rate));
    });

    return totalLiquidityUSDsupplyApySum.dividedBy(totalLiquidityUSDsum);
  }

  public getTotalAvgBorrowApy(ommApyIncluded = false): BigNumber {
    let totalBorrowUSDsum = new BigNumber("0");
    let totalBorrowUSDsupplyApySum = new BigNumber("0");

    if (!this.persistenceService.allReserves) {
      return new BigNumber("0");
    }

    let reserve: ReserveData | undefined;
    Object.values(AssetTag).forEach((assetTag: AssetTag) => {
      reserve = this.persistenceService.allReserves!.getReserveData(assetTag);
      const borrowRate = reserve.borrowRate;
      const rate = ommApyIncluded ? this.calculateBorrowApyWithOmmRewards(assetTag).minus(borrowRate) :
        Utils.makeNegativeNumber(borrowRate);
      totalBorrowUSDsum = totalBorrowUSDsum.plus(reserve.totalBorrowsUSD);
      totalBorrowUSDsupplyApySum = totalBorrowUSDsupplyApySum.plus(reserve.totalBorrowsUSD.multipliedBy(rate));
    });

    return totalBorrowUSDsupplyApySum.dividedBy(totalBorrowUSDsum);
  }

  public getYourSupplyApy(ommApyIncluded = false): BigNumber {
    let supplyApySum = new BigNumber("0");
    let supplySum = new BigNumber("0");
    let supplied;
    let supplyApy;

    // Sum(My supply amount for each asset * Supply APY for each asset)
    this.persistenceService.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined, assetTag: AssetTag) => {
      supplied = reserve?.currentOTokenBalanceUSD ?? new BigNumber("0");
      supplyApy = reserve?.liquidityRate ?? new BigNumber("0");
      const rate = ommApyIncluded ? supplyApy.plus(this.calculateSupplyApyWithOmmRewards(assetTag)) : supplyApy;
      supplyApySum = supplyApySum.plus(supplied.multipliedBy(rate));
      supplySum = supplySum.plus(supplied);
    });

    return supplyApySum.dividedBy(supplySum);
  }

  public getYourBorrowApy(ommApyIncluded = false): BigNumber {
    let borrowApySum = new BigNumber("0");
    let borrowSum = new BigNumber("0");
    let borrowed;
    let borrowApy;

    // Sum(My borrow amount for each asset * Borrow APY for each asset)
    this.persistenceService.userReserves.reserveMap.forEach((reserve: UserReserveData | undefined, assetTag: AssetTag) => {
      borrowed = reserve?.currentBorrowBalanceUSD ?? new BigNumber("0");
      borrowApy = reserve?.borrowRate ?? new BigNumber("0");
      const rate = ommApyIncluded ?  this.calculateBorrowApyWithOmmRewards(assetTag).minus(borrowApy) : Utils.makeNegativeNumber(borrowApy);
      borrowApySum = borrowApySum.plus(borrowed.multipliedBy(rate));
      borrowSum = borrowSum.plus(borrowed);
    });

    return borrowApySum.dividedBy(borrowSum);
  }

  public calculateBorrowFee(amount?: BigNumber): BigNumber {

    if (!amount) {
      return new BigNumber("0");
    }

    const loanOriginationFeePercentage = this.persistenceService.loanOriginationFeePercentage ?? new BigNumber("0.001");

    return amount.multipliedBy(loanOriginationFeePercentage);
  }

  public calculatePrepsIcxReward(prep: Prep, prepList: PrepList, index: number): BigNumber {
    const blockValidationRewards = prepList.avgIRep.dividedBy(new BigNumber("2"));

    const delegationRate = prep.delegated.dividedBy(prepList.totalDelegated);

    const representativeRewards = blockValidationRewards.multipliedBy(new BigNumber("100")).multipliedBy(delegationRate);

    return (index < 22 ? blockValidationRewards.plus(representativeRewards) : representativeRewards).dividedBy(30);
  }


  /** calculate total supplied both for base and quote token
   * Formula: totalStakedBalance / Total LP tokens in the Balanced pool (i.e. poolStats -> total_supply) * getPoolTotal (Balanced API #23)
   * do it twice for base token/quote token (getPoolData dynamic)
   */
  public calculatePoolTotalSupplied(poolData: PoolData, base: boolean = true): BigNumber {
    const totalStakedBalance = poolData.totalStakedBalance;
    const totalLpTokenInPool = poolData.poolStats.totalSupply;

    return totalStakedBalance.dividedBy(totalLpTokenInPool).multipliedBy((base ? poolData.poolStats.base : poolData.poolStats.quote));
  }

  /** calculate total supplied both for base and quote token
   * Formula: userStakedBalance / Total LP tokens in the Balanced pool (i.e. poolStats -> total_supply) * getPoolTotal (Balanced API #23)
   * do it twice for base token/quote token (getPoolData dynamic)
   */
  public calculateUserPoolSupplied(poolData: UserPoolData, base: boolean = true): BigNumber {
    const userStakedBalance = poolData.userStakedBalance;
    const totalLpTokenInPool = poolData.poolStats.totalSupply;

    return userStakedBalance.dividedBy(totalLpTokenInPool).multipliedBy((base ? poolData.poolStats.base : poolData.poolStats.quote));
  }

  /** Formula: Daily OMM distribution (1M) * Pool pair portion (0.05), same across all 3 pools (OMM/USDS, OMM/iUSDC, OMM/sICX) */
  public calculateDailyRewardsForPool(poolData: PoolData): BigNumber {
    return this.persistenceService.tokenDistributionPerDay.multipliedBy(this.persistenceService.getDistPercentageOfPool(poolData.poolId));
  }

  /** Formula: userStakedBalance / totalStakedBalance * Daily OMM distribution (1M) * OMM/USDS pair portion (0.05) */
  public calculateUserDailyRewardsForPool(poolData: UserPoolData): BigNumber {
    return poolData.userStakedBalance.dividedBy(poolData.totalStakedBalance).multipliedBy(this.persistenceService.tokenDistributionPerDay)
      .multipliedBy(this.persistenceService.getDistPercentageOfPool(poolData.poolId));
  }

  /** Formula: Sum (Daily rewards_Liquidity Pools2 across 3 pools) */
  public calculateDailyRewardsAllPools(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.allPools.forEach(poolData => {
      res = res.plus(this.calculateDailyRewardsForPool(poolData));
    });

    return res;
  }

  /** Formula: Sum (Daily rewards_Liquidity Pools2 across 3 pools) */
  public calculateDailyRewardsUserPools(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.userPools.forEach(poolData => {
      res = res.plus(this.calculateUserDailyRewardsForPool(poolData));
    });

    return res;
  }

  /** Formula: Sum (Daily rewards_Liquidity Pools2 across 3 pools) */
  public calculateTotalPoolsStaked(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.allPools.forEach(poolData => {
      res = res.plus(poolData.totalStakedBalance);
    });

    return res;
  }

  /** Formula: Daily rewards * OMM price * 365/Total supplied in $ value */
  public calculatePoolLiquidityApy(poolData: PoolData): BigNumber {
    const dailyRewards = this.calculateDailyRewardsForPool(poolData);
    const ommPrice = this.persistenceService.ommPriceUSD;
    const totalSuppliedUSD = this.calculatePoolTotalSuppliedInUSD(poolData);

    if (Utils.isUndefinedOrZero(dailyRewards) || Utils.isUndefinedOrZero(totalSuppliedUSD) || Utils.isUndefinedOrZero(ommPrice)) {
      return new BigNumber("0");
    }

    return dailyRewards.multipliedBy(ommPrice).multipliedBy(new BigNumber("365")).dividedBy(totalSuppliedUSD);
  }

  /** Calculate total supplied for base token (OMM) of pool */
  public calculatePoolTotalSuppliedOmm(poolData: PoolData): BigNumber {
    return this.calculatePoolTotalSupplied(poolData, true);
  }

  public calculateDailyOmmStakingRewards(): BigNumber {
    const dailyOmmDistribution = this.persistenceService.tokenDistributionPerDay;
    const stakingOmmDistPercentage = this.persistenceService.allAssetDistPercentages?.staking?.OMM ?? new BigNumber("0");

    return dailyOmmDistribution.multipliedBy(stakingOmmDistPercentage);
  }

  /** Formulae: Daily OMM staking rewards * 365/Total OMM staked */
  public calculateStakingApy(): BigNumber {
    const dailyOmmStakingRewards = this.calculateDailyOmmStakingRewards();
    const totalStakedOmm = this.persistenceService.totalStakedOmm;

    if (dailyOmmStakingRewards.isZero() || totalStakedOmm.isZero()) {
      return new BigNumber("0");
    }

    return dailyOmmStakingRewards.multipliedBy(new BigNumber("365")).dividedBy(totalStakedOmm);
  }

  /** Formulae: Daily OMM staking rewards* User's OMM staked/Total OMM staked */
  public calculateDailyUsersOmmStakingRewards(stakedOmm?: BigNumber): BigNumber {
    const dailyOmmStakingRewards = this.calculateDailyOmmStakingRewards();
    const usersOmmStaked = stakedOmm ? stakedOmm : this.persistenceService.getUsersStakedOmmBalance();
    const totalOmmStaked = this.persistenceService.totalStakedOmm;

    if (dailyOmmStakingRewards.isLessThanOrEqualTo(Utils.ZERO) || usersOmmStaked.isLessThanOrEqualTo(Utils.ZERO)
      || totalOmmStaked.isLessThanOrEqualTo(Utils.ZERO)) {
      return new BigNumber("0");
    }

    return dailyOmmStakingRewards.multipliedBy(usersOmmStaked).dividedBy(totalOmmStaked);
  }

  public calculateUserOmmStakingDailyRewardsUSD(stakedOmm?: BigNumber): BigNumber {
    return this.calculateDailyUsersOmmStakingRewards(stakedOmm).multipliedBy(this.persistenceService.ommPriceUSD);
  }


  /** Calculate total supplied for base and quote token of pool in USD */
  public calculatePoolQuoteAndBaseSuppliedInUSD(poolData: PoolData): BigNumber {
    const quoteAssetTag = AssetTag.constructFromPoolPairName(poolData.poolStats.name);

    if (!quoteAssetTag) {
      return new BigNumber("0");
    }

    const totalSuppliedBaseUSD = this.calculatePoolTotalSupplied(poolData, true).multipliedBy(this.persistenceService.ommPriceUSD);
    const totalSuppliedQuoteUSD = this.calculatePoolTotalSupplied(poolData, false).multipliedBy(this.persistenceService
      .getAssetExchangePrice(quoteAssetTag));

    return totalSuppliedBaseUSD.plus(totalSuppliedQuoteUSD);
  }

  /** Formula: # of quote token balance from Total Supplied (sICX, USDS, iUSDC) * respective token price *2 */
  public calculatePoolTotalSuppliedInUSD(poolData: PoolData): BigNumber {
    const quoteAssetTag = AssetTag.constructFromPoolPairName(poolData.poolStats.name);

    if (!quoteAssetTag) {
      return new BigNumber("0");
    }

    return this.calculatePoolTotalSupplied(poolData, false).multipliedBy(this.persistenceService.getAssetExchangePrice(quoteAssetTag))
      .multipliedBy(new BigNumber("2"));
  }

  /** Calculate user total supplied for base and quote token of pool in USD */
  public calculateUserPoolTotalSuppliedUSD(poolData: UserPoolData): BigNumber {
    const quoteAssetTag = AssetTag.constructFromPoolPairName(poolData.poolStats.name);

    if (!quoteAssetTag) {
      return new BigNumber("0");
    }

    const totalSuppliedBaseUSD = this.calculateUserPoolSupplied(poolData, true).multipliedBy(this.persistenceService.ommPriceUSD);
    const totalSuppliedQuoteUSD = this.calculateUserPoolSupplied(poolData, false).multipliedBy(this.persistenceService
      .getAssetExchangePrice(quoteAssetTag));

    return totalSuppliedBaseUSD.plus(totalSuppliedQuoteUSD);
  }

  /** Formula: Sum(Total supplied assets across 3 pools in $ value) */
  public getAllPoolTotalLiquidityUSD(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.allPools.forEach(poolData => {
      res = res.plus(this.calculatePoolQuoteAndBaseSuppliedInUSD(poolData));
    });

    return res;
  }

  /** Formula: Sum(you've supplied assets across 3 pools in $ value) */
  public getUserTotalLiquidityUSD(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.userPools.forEach(poolData => {
      res = res.plus(this.calculateUserPoolTotalSuppliedUSD(poolData));
    });

    return res;
  }

  /** Formula: Sum(you've supplied assets across 3 pools in $ value) */
  public getUserTotalPoolOmmStaked(): BigNumber {
    let res = new BigNumber("0");
    this.persistenceService.userPools.forEach(poolData => {
      res = res.plus(poolData.userStakedBalance);
    });

    return res;
  }

  /** Formula: Sum(Liquidity APY (all pools) * Total supplied assets in $ value)/(Total liquidity) */
  public getAllPoolsAverageApy(): BigNumber {
    let sum = new BigNumber("0");
    this.persistenceService.allPools.forEach(poolData => {
      sum = sum.plus(this.calculatePoolLiquidityApy(poolData).multipliedBy(this.calculatePoolQuoteAndBaseSuppliedInUSD(poolData)));
    });

    const totalLiquidity = this.getAllPoolTotalLiquidityUSD();

    return sum.dividedBy(totalLiquidity);
  }

  /** Formula: Sum(Liquidity APY (your pools) * You've supplied assets $ value)/(your liquidity) */
  public getUserPoolsAverageApy(): BigNumber {
    let sum = new BigNumber("0");
    this.persistenceService.userPools.forEach(poolData => {
      sum = sum.plus(this.calculatePoolLiquidityApy(poolData).multipliedBy(this.calculateUserPoolTotalSuppliedUSD(poolData)));
    });

    const totalLiquidity = this.getAllPoolTotalLiquidityUSD();

    return sum.dividedBy(totalLiquidity);
  }

}
