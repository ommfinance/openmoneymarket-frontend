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
