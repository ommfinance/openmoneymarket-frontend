// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  iconRpcUrl: "https://bicon.net.solidwallet.io/api/v3",
  iconDebugRpcUrl: "https://bicon.net.solidwallet.io/api/debug/v3",
  ADDRESS_PROVIDER_SCORE: 'cx797bc63e7b27758816910cb35f0fa1f546b57c33', // old stable provider
  // ADDRESS_PROVIDER_SCORE: 'cx19aa6bc8824297f191d695c00101ecafbce33e16', // new one supports delegations
  // testnet (1)
  ledgerBip32Path: "44'/4801368'/0'/0'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
  IISS_API: "cx0000000000000000000000000000000000000000",
  NID: 3
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
