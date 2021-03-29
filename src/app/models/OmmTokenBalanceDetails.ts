import {Utils} from "../common/utils";

export class OmmTokenBalanceDetails {
  totalBalance: number;
  availableBalance: number;
  stakedBalance: number;
  unstakingBalance: number;
  unstakingTimeInMills: number;


  constructor(totalBalance: number, availableBalance: number, stakedBalance: number, unstakingBalance: number,
              unstakingTimeInMills: number) {
    this.totalBalance = totalBalance;
    this.availableBalance = availableBalance;
    this.stakedBalance = stakedBalance;
    this.unstakingBalance = unstakingBalance;
    this.unstakingTimeInMills = unstakingTimeInMills;
  }

  public getClone(): OmmTokenBalanceDetails {
    return new OmmTokenBalanceDetails(
      Utils.roundDownToZeroDecimals(this.totalBalance),
      Utils.roundDownToZeroDecimals(this.availableBalance),
      Utils.roundDownToZeroDecimals(this.stakedBalance),
      Utils.roundDownToZeroDecimals(this.unstakingBalance),
      this.unstakingTimeInMills
    );
  }

}

// Example response
// {
//   "totalBalance": 20000000000000000000,
//   "availableBalance": 0,
//   "stakedBalance": 20000000000000000000,
//   "unstakingBalance": 0,
//   "unstakingTimeInMills": 1613385764000
//
// }
