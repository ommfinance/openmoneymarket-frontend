import {Wallet, WalletType} from "./Wallet";

export class LedgerWallet extends Wallet {

  path: string;

  constructor(address: string, path: string = "") {
    super(WalletType.LEDGER, address);
    this.path = path;
  }

}
