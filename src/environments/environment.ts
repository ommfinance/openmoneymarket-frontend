// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  iconRpcUrl: "https://lisbon.net.solidwallet.io/api/v3",
  ommRestApi: "https://api.omm.finance/api/v1",
  iconDebugRpcUrl: "https://lisbon.net.solidwallet.io/api/v3d",
  ADDRESS_PROVIDER_SCORE: 'cxaad5f58e963132fe8283cee10280a7e842e47cfe',
  BALANCED_DEX_SCORE: "cx7a90ed2f781876534cf1a04be34e4af026483de4",
  ledgerBip32Path: "44'/4801368'/0'/0'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
  IISS_API: "cx0000000000000000000000000000000000000000",
  NID: 2,
  REWARDS_ACCRUE_START: 1628312400, // unix timestamp from when rewards accrue will start
  REWARDS_CLAIMABLE_START: 1628917200, // unix timestamp from when rewards are going to be claimable
  ACTIVATE_REWARDS_TIMESTAMPS: false, // boolean flag deciding if above two timestamp should be respected
  SHOW_BANNER: false,
  NETWORK: "Lisbon"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
