import {Asset, AssetTag, supportedAssetsMap} from "../Asset";

export abstract class Wallet {
  address = "";
  balances: Map<AssetTag, number> = new Map([
    [AssetTag.USDB, 0],
    [AssetTag.ICX, 0],
    [AssetTag.USDC, 0],
  ]);
  type: WalletType;

  protected constructor(type: WalletType, address?: string) {
    this.address = address ?? "";
    this.type = type;
    this.balances = new Map<AssetTag, number>();
    supportedAssetsMap.forEach((value: Asset, key: AssetTag) => {
      this.balances.set(key, 0);
    });
  }
}

export enum WalletType {
  ICONEX,
  BRIDGE,
  LEDGER
}
