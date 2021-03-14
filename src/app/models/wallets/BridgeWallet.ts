// @ts-ignore
import {BridgeService} from "../../../../build/bridge.bundle";
import {Wallet, WalletType} from "./Wallet";
import {AssetTag} from "../Asset";

export class BridgeWallet extends Wallet {
  email: string;
  bridgeInstance: BridgeService;

  constructor(address: string, email: string, bridgeInstance: BridgeService, balances?: Map<AssetTag, number>) {
    super(WalletType.BRIDGE);
    this.address = address;
    this.email = email;
    this.bridgeInstance = bridgeInstance;
    if (balances) {
      this.balances = balances;
    }
  }

}
