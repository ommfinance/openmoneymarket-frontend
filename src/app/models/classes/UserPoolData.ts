import {PoolStats} from "./PoolStats";
import BigNumber from "bignumber.js";

export class UserPoolData {
  poolId: BigNumber;
  totalStakedBalance: BigNumber;
  userAvailableBalance: BigNumber;
  userStakedBalance: BigNumber;
  userTotalBalance: BigNumber;
  poolStats: PoolStats;


  constructor(poolId: BigNumber, totalStakedBalance: BigNumber, userAvailableBalance: BigNumber, userStakedBalance: BigNumber,
              userTotalBalance: BigNumber,
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

  // get name without pool numbers
  getCleanPoolName(): string {
    return this.poolStats.name.replace(" ", "").replace(/[0-9]/g, '');
  }

  getQuoteAssetName(): string {
    return this.poolStats.name.replace(" ", "").split("/")[1];
  }
}
