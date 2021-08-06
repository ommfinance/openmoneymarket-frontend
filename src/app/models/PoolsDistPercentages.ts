import {Utils} from "../common/utils";
import log from "loglevel";

export class PoolsDistPercentages {
  liquidity: any;


  constructor(liquidity: any) {
    this.liquidity = liquidity;
  }

  getDistPercentageForPool(poolId: number): number {
    const hexDistPercentage = this.liquidity[poolId.toString()];

    if (!hexDistPercentage) {
      log.warn("Failed to retrieve distribution percentage for pool " + poolId);
      return 0;
    }

    return Utils.hexToNormalisedNumber(this.liquidity[poolId.toString()]);
  }
}
