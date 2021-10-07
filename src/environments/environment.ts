export const environment = {
  production: false,
  iconRpcUrl: "https://bicon.net.solidwallet.io/api/v3",
  ommRestApi: "https://omm-stats-api-dev-r8jdq.ondigitalocean.app/api/v1",
  iconDebugRpcUrl: "https://bicon.net.solidwallet.io/api/debug/v3",
  ADDRESS_PROVIDER_SCORE: 'cxeb820fe7a5470eb52bcd5fa6cdd3a4480a2de0d8',
  BALANCED_DEX_SCORE: "cx399dea56cf199b1c9e43bead0f6a284bdecfbf62",
  ledgerBip32Path: "44'/4801368'/0'/0'",
  GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
  IISS_API: "cx0000000000000000000000000000000000000000",
  NID: 3,
  REWARDS_ACCRUE_START: 1628312400, // unix timestamp from when rewards accrue will start
  REWARDS_CLAIMABLE_START: 1628917200, // unix timestamp from when rewards are going to be claimable
  ACTIVATE_REWARDS_TIMESTAMPS: false, // boolean flag deciding if above two timestamp should be respected
};

