import {Asset, AssetTag, supportedAssetsMap} from "./Asset";

export abstract class Wallet {
  address = "";
  balances: Map<AssetTag, number> = new Map([
    [AssetTag.USDb, 0],
    [AssetTag.ICX, 0],
  ]);

  protected constructor(address?: string) {
    this.address = address ?? "";
    this.balances = new Map<AssetTag, number>();
    supportedAssetsMap.forEach((value: Asset, key: AssetTag) => {
      this.balances.set(key, 0);
    });
  }
}
