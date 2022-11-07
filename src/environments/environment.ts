// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  iconRpcUrl: "https://ctz.solidwallet.io/api/v3",
  ommRestApi: "https://api.omm.finance/api/v1",
  iconDebugRpcUrl: "https://ctz.solidwallet.io/api/v3d",
  ADDRESS_PROVIDER_SCORE: 'cx6a66130200b4f08c65ef394469404378ab52e5b6',
  BALANCED_DEX_SCORE: "cxa0af3165c08318e988cb30993b3048335b94af6c",
  ledgerBip32Path: "44'/4801368'/0'/0'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
  IISS_API: "cx0000000000000000000000000000000000000000",
  NID: 1,
  REWARDS_ACCRUE_START: 1629954000, // unix timestamp from when rewards accrue will start
  REWARDS_CLAIMABLE_START: 1630386000, // unix timestamp from when rewards are going to be claimable
  ACTIVATE_REWARDS_TIMESTAMPS: true, // boolean flag deciding if above two timestamp should be respected
  SHOW_BANNER: false,
  NETWORK: "Mainnet"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
