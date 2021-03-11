export class DelegationPreference {
  "_address": string;
  "_votes_in_per": number;

  constructor(address: string, votesInPer: number) {
    this._address = address;
    this._votes_in_per = votesInPer;
  }
}
