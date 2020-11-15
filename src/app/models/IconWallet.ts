import {TokenBalances} from "./TokenBalances";

export class IconWallet {
  address: string;
  balances: TokenBalances;

  constructor(address: string, balances: TokenBalances) {
    this.address = address;
    this.balances = balances;
  }

}
