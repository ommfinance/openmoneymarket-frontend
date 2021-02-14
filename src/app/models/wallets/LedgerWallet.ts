import {Wallet} from "./Wallet";

export class LedgerWallet extends Wallet {

  path: string;

  constructor(address: string, path: string = "") {
    super(address);
    this.path = path;
  }

}
