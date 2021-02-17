// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  iconRpcUrl: "https://bicon.net.solidwallet.io/api/v3",
  ADDRESS_PROVIDER_SCORE: 'cxdcbae76661c0edbf968d048c3bba3311bde57e37',
  // testnet (1)
  ledgerBip32Path: "44'/4801368'/1'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
