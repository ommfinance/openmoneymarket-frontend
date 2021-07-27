import {PoolStats} from "./PoolStats";

export class UserPoolData {
  poolId: number;
  totalStakedBalance: number;
  userAvailableBalance: number;
  userStakedBalance: number;
  userTotalBalance: number;
  poolStats: PoolStats;


  constructor(poolId: number, totalStakedBalance: number, userAvailableBalance: number, userStakedBalance: number, userTotalBalance: number,
              poolStats: PoolStats) {
    this.poolId = poolId;
    this.totalStakedBalance = totalStakedBalance;
    this.userAvailableBalance = userAvailableBalance;
    this.userStakedBalance = userStakedBalance;
    this.userTotalBalance = userTotalBalance;
    this.poolStats = poolStats;
  }

  getPrettyName(): string {
    const splitString = this.poolStats.name.replace(" ", "").split("/");
    return splitString[0] + " / " + splitString[1];
  }

  // used for css, e.g. OMM/USDS -> omm-usds
  getPairClassName(): string {
    const splitString = this.poolStats.name.replace(" ", "").replace(/[0-9]/g, '').toLowerCase().split("/");
    return splitString[0] + "-" + splitString[1];
  }

  getQuoteAssetName(): string {
    return this.poolStats.name.replace(" ", "").split("/")[1];
  }
}