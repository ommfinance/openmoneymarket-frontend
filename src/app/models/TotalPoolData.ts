export interface TotalPoolData {
  poolID: number;
  totalStakedBalance: number;
}

export interface UserPoolData {
  poolID: number;
  totalStakedBalance: number;
  userAvailableBalance: number;
  userStakedBalance: number;
  userTotalBalance: number;
}
