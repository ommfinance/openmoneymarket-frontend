export class ScoreMethodNames {

  /*
   * AddressProvider SCORE
   */
  public static GET_ALL_ADDRESSES = "getAllAddresses";
  /*
   * LendingPool SCORE
   */
  public static DEPOSIT_USDB = "deposit";
  public static WITHDRAW_USDB = "redeem";
  public static BORROW_USDB = "borrow";

  /*
   * IRC2 interface methods
   */
  public static TRANSFER = "transfer";
  public static BALANCE = "balanceOf";

  /*
   * LendingPoolDataProvider SCORE
   */
  public static GET_USER_RESERVE_DATA = "getUserReserveData";
  public static GET_USER_ALL_RESERVE_DATA = "getUserAllReserveData";
  public static GET_ALL_RESERVE_DATA = "getAllReserveData";
}
