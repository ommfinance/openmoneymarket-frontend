import BigNumber from "bignumber.js";

export class PrepList {
  prepAddressToNameMap: Map<string, string>;
  totalDelegated: BigNumber;
  totalStake: BigNumber;
  preps: Prep[];


  constructor(totalDelegated: BigNumber, totalStake: BigNumber, preps: Prep[]) {
    this.totalDelegated = totalDelegated;
    this.totalStake = totalStake;
    this.preps = preps;
    this.prepAddressToNameMap = new Map<string, string>();
    preps.forEach(prep => {
      this.prepAddressToNameMap.set(prep.address, prep.name);
    });
  }
}

export class Prep {
  address: string;
  name: string;
  stake: BigNumber;
  delegated: BigNumber;
  irep: BigNumber;
  details: string;
  logoUrl = "assets/img/icon/profile.svg";


  constructor(address: string, name: string, stake: BigNumber, delegated: BigNumber, irep: BigNumber, details: string,
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
    this.logoUrl = logoUrl ? logoUrl : "assets/img/icon/profile.svg";
  }

}
