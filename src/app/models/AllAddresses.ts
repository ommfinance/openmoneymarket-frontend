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

  collateralAddress(assetTag: AssetTag): string {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.collateral.sICX;
      case AssetTag.USDB:
        return this.collateral.USDb;
      case AssetTag.USDC:
        return this.collateral.IUSDC;
      default:
        return "";
    }
  }

  oTokenAddress(assetTag: AssetTag): string {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.oTokens.oICX;
      case AssetTag.USDB:
        return this.oTokens.oUSDb;
      case AssetTag.USDC:
        return this.oTokens.oIUSDC;
      default:
        return "";
    }
  }
}

interface Collateral {
  USDb: string;
  sICX: string;
  IUSDC: string;
}

interface OTokens {
  oUSDb: string;
  oICX: string;
  oIUSDC: string;
}

interface SystemContract {
  LendingPool: string;
  LendingPoolDataProvider: string;
  Staking: string;
  Rewards: string;
  OmmToken: string;
  Delegation: string;
}
