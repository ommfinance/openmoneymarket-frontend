import {AssetTag} from "./Asset";

export class AllAddresses {
  collateral: Collateral;
  oTokens: OTokens;
  systemContract: SystemContract;


  constructor(collateral: Collateral, oTokens: OTokens, systemContract: SystemContract) {
    this.collateral = collateral;
    this.oTokens = oTokens;
    this.systemContract = systemContract;
  }

  getAssetAddress(assetTag: AssetTag): string {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.collateral.sICX;
      case AssetTag.USDb:
        return this.collateral.USDb;
    }
  }
}

interface Collateral {
  USDb: string;
  sICX: string;
}

interface OTokens {
  oUSDb: string;
  oICX: string;
}

interface SystemContract {
  LendingPool: string;
  LendingPoolDataProvider: string;
  Staking: string;
}
