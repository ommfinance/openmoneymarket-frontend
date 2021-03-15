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


  constructor(address: string, name: string, stake: number, delegated: number, irep: number, details: string) {
    this.address = address;
    this.name = name;
    this.stake = stake;
    this.delegated = delegated;
    this.irep = irep;
    this.details = details
  }
}
