export class ScoreMethodNames {

  /**
   * AddressProvider SCORE
   */
  public static GET_ALL_ADDRESSES = "getAllAddresses";

  /**
   * LendingPool SCORE
   */
  public static DEPOSIT = "deposit";
  public static REDEEM = "redeem";
  public static BORROW = "borrow";

  /**
   * IRC2 interface methods
   */
  public static TRANSFER = "transfer";
  public static BALANCE = "balanceOf";

  /**
   * LendingPoolDataProvider SCORE
   */
  public static GET_USER_RESERVE_DATA = "getUserReserveData";
  public static GET_USER_ALL_RESERVE_DATA = "getUserAllReserveData";
  public static GET_ALL_RESERVE_DATA = "getAllReserveData";
  public static GET_SPECIFIC_RESERVE_DATA = "getReserveData";
  public static GET_USER_ACCOUNT_DATA = "getUserAccountData";
  public static GET_RESERVE_CONFIGURATION_DATA = "getReserveConfigurationData";
  public static GET_ALL_RESERVE_CONFIGURATION_DATA = "getAllReserveConfigurationData";
  public static GET_TOKEN_DISTRIBUTION_PER_DAY = "tokenDistributionPerDay";
  public static GET_LOAN_ORIGINATION_FEE_PERCENTAGE = "getLoanOriginationFeePercentage";

 /**
  * Rewards SCORE
  */
  public static CLAIM_OMM_REWARDS = "claimRewards";
  public static GET_OMM_REWARDS_PER_USER = "getRewards";
  public static GET_OMM_TOKEN_BALANCE_DETAILS = "details_balanceOf";

  /**
   * OmmToken SCORE
   */
  public static UNSTAKE_OMM = "unstake";
  public static STAKE_OMM = "stake";
  public static GET_MIN_STAKE = "getMinimumStake";

  /**
   * Delegation SCORE
   */
  public static GET_USER_DELEGATION_DETAILS = "getUserDelegationDetails";
  public static UPDATE_DELEGATIONS = "updateDelegations";

  /**
   * Staking SCORE
   */
  public static GET_TODAY_RATE = "getTodayRate";
  public static GET_PREP_TOP_LIST = "getTopPreps";

  /**
   * IISS APIs
   */
  public static GET_PREPS = "getPReps";
  public static GET_PREP = "getPRep";
}
