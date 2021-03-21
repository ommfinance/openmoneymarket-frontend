export class YourPrepVote {
  address: string;
  name: string;
  percentage: number;

  constructor(address: string, name: string, percentage: number) {
    this.address = address;
    this.name = name;
    this.percentage = percentage;
  }
}
