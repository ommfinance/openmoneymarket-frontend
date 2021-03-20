import log from "loglevel";

export class PrepList {
  totalDelegated: number;
  totalStake: number;
  preps: Prep[];


  constructor(totalDelegated: number, totalStake: number, preps: Prep[]) {
    this.totalDelegated = totalDelegated;
    this.totalStake = totalStake;
    this.preps = preps;
  }
}

export class Prep {
  address: string;
  name: string;
  stake: number;
  delegated: number;
  irep: number;
  details: string;
  logoUrl = "assets/img/icon/profile.svg";


  constructor(address: string, name: string, stake: number, delegated: number, irep: number, details: string,
              logoUrl: string = "assets/img/icon/profile.svg") {
    this.address = address;
    this.name = name;
    this.stake = stake;
    this.delegated = delegated;
    this.irep = irep;
    this.details = details;
    this.logoUrl = logoUrl;
  }

  setLogoUrl(logoUrl: string | undefined): void {
    log.debug("Setting logo url:", logoUrl);
    this.logoUrl = logoUrl ? logoUrl : "assets/img/icon/profile.svg";
  }

}
