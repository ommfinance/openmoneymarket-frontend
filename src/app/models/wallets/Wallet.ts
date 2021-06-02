import {Asset, AssetTag, CollateralAssetTag, supportedAssetsMap} from "../Asset";

export abstract class Wallet {
  address = "";
  balances: Map<AssetTag, number>;
  // collateral assets balances differentiates by ICX -> sICX
  collateralBalances: Map<CollateralAssetTag, number>
  type: WalletType;

  protected constructor(type: WalletType, address?: string) {
    this.address = address ?? "";
    this.type = type;
    this.balances = new Map<AssetTag, number>();
    this.collateralBalances = new Map<CollateralAssetTag, number>();

    // init asset balances
    supportedAssetsMap.forEach((value: Asset, key: AssetTag) => {
      this.balances.set(key, 0);
    });

    // init collateral asset balances
    Object.values(CollateralAssetTag).forEach((assetTag: CollateralAssetTag) => {
      this.collateralBalances.set(assetTag, 0)
    });
  }
}

export enum WalletType {
  ICONEX,
  BRIDGE,
  LEDGER
}
