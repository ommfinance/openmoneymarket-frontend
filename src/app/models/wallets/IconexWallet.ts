import {Wallet, WalletType} from "./Wallet";
import {AssetTag} from "../Asset";

export class IconexWallet extends Wallet{

  constructor(address: string, balances?: Map<AssetTag, number>) {
    super(WalletType.ICONEX);
    this.address = address;
    if (balances) {
      this.balances = balances;
    }
  }

}
