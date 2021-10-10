export const environment = {
  production: true,
  iconRpcUrl: "https://ctz.solidwallet.io/api/v3",
  ommRestApi: "https://api.omm.finance/api/v1",
  iconDebugRpcUrl: "https://ctz.solidwallet.io/api/debug/v3",
  ADDRESS_PROVIDER_SCORE: 'cx77497caa623b73bb492942081eb809f824b9c82a',
  BALANCED_DEX_SCORE: "cxa0af3165c08318e988cb30993b3048335b94af6c",
  ledgerBip32Path: "44'/4801368'/0'/0'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
  IISS_API: "cx0000000000000000000000000000000000000000",
  NID: 1,
  REWARDS_ACCRUE_START: 1629781200, // unix timestamp from when rewards accrue will start
  REWARDS_CLAIMABLE_START: 1630213200, // unix timestamp from when rewards are going to be claimable
  ACTIVATE_REWARDS_TIMESTAMPS: false, // boolean flag deciding if above two timestamp should be respected
  DISABLE_SICX_BORROW: false,
};
