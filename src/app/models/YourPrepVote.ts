export class YourPrepVote {
  address: string;
  name: string;
  delegated: number;

  constructor(address: string, name: string, delegated: number) {
    this.address = address;
    this.name = name;
    this.delegated = delegated;
  }
}
