export class Prep {
  name: string;
  earnings: Earnings;
  votes: Votes;


  constructor(name: string, earnings: Earnings, votes: Votes) {
    this.name = name;
    this.earnings = earnings;
    this.votes = votes;
  }
}

export class Votes {
  percent: number;
  amount: number;

  constructor(percent: number, amount: number) {
    this.percent = percent;
    this.amount = amount;
  }
}

export class Earnings {
  USD: number;
  ICX: number;

  constructor(USD: number, ICX: number) {
    this.USD = USD;
    this.ICX = ICX;
  }
}
