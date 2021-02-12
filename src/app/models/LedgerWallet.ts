import {Wallet} from "./Wallet";

export class LedgerWallet extends Wallet {

  constructor(address: string) {
    super(address);
  }
}
