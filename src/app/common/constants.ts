/** Modal constants */
export const BORROW = "Borrow";
export const SUPPLY = "Supply";
export const REPAY = "Repay";
export const WITHDRAW = "Withdraw";

export const defaultPrepLogoUrl = "assets/img/icon/profile.svg";

export const ommForumDomain = "forum.omm.finance";

export const ommBannerExitKey = "omm-bnr-closed";

export const contributorsMap = new Map([
  ["hxfba37e91ccc13ec1dab115811f73e429cde44d48", true], // ICX_Station
  ["hx28c08b299995a88756af64374e13db2240bc3142", true], // PARROT9
  ["hx231a795d1c719b9edf35c46b9daa4e0b5a1e83aa", true], // iBriz - ICONOsphere
  ["hx2bbb1b0300f5dc0caa0e1a3ba1701a22e7590763", true] //  Protokol7
]);

// how much ICX should be left when user is supplying
export const ICX_SUPPLY_BUFFER = 2;

export const DEFAULT_SLIDER_MAX = 0.001;

// notification timeout
export const NOTIFICATION_TIMEOUT = 5000; // ms

// Regexes
export const BORROW_MAX_ERROR_REGEX = new RegExp('amount\\s+requested.*is\\s+more\\s+than\\s+the.*');

export class Times {
  /** Class containing times (seconds, minutes, ..) in seconds, milliseconds and methods to retrieve arbitrary time in it */
  public static readonly SECOND_IN_MILLISECONDS = 1000;
  public static readonly MINUTE_IN_MILLISECONDS = 60000;
  public static readonly HOUR_IN_MILLISECONDS = 3600000;
  public static readonly DAY_IN_MILLISECONDS = 86400000;

  public static readonly MINUTE_IN_SECONDS = 60;
  public static readonly HOUR_IN_SECONDS = 3600;
  public static readonly DAY_IN_SECONDS = 86400;

  public static secondsInMilliseconds(seconds: number): number {
    return seconds * Times.SECOND_IN_MILLISECONDS;
  }

  public static minutesInMilliseconds(minutes: number): number {
    return minutes * Times.MINUTE_IN_MILLISECONDS;
  }

  public static minutesInSeconds(minutes: number): number {
    return minutes * Times.MINUTE_IN_SECONDS;
  }

  public static daysInSeconds(days: number): number {
    return days * Times.DAY_IN_SECONDS;
  }
}

export const bnUSDProposalDescription = "" +
  "Proposed OMM Rewards\n" +
  "- ICX = 40%\n" +
  "- IUSDC = 20%\n" +
  "- USDS = 20%\n" +
  "- bnUSD = 20%\n" +
  "Proposed Borrow vs Lend rewards\n" +
  "- Borrow = 50%\n" +
  "- Lend = 50%\n" +
  "Proposed LTV\n" +
  "- LTV = 0%";
