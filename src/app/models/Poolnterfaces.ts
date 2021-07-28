export interface TotalPoolInterface {
  poolID: number;
  totalStakedBalance: number;
}

export interface UserPoolDataInterface {
  poolID: number;
  totalStakedBalance: number;
  userAvailableBalance: number;
  userStakedBalance: number;
  userTotalBalance: number;
}
