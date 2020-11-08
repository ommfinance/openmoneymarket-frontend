export interface AllAddresses {
  collateral: Collateral;
  oTokens: OTokens;
  systemContract: SystemContract;
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
}
