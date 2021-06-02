export class Asset {
  className: AssetClass; // e.g. "usdb"
  name: AssetName; // e.g. "Bridge Dollars
  tag: AssetTag; // e.g. USDb

  constructor(className: AssetClass, name: AssetName, tag: AssetTag) {
    this.className = className;
    this.name = name;
    this.tag = tag;
  }
}

export enum AssetClass {
  USDb = "usdb",
  ICX = "icx",
  USDC = "usdc"
}

export enum AssetName {
  USDb = "Bridge Dollars",
  ICX = "ICON",
  USDC = "ICON USD Coin"
}

export class AssetTag {
  static USDB = "USDB";
  static ICX = "ICX";
  static USDC = "IUSDC";
}

export class CollateralAssetTag {
  static USDB = "USDB";
  static sICX = "sICX";
  static USDC = "IUSDC";
}

export const supportedAssetsMap: Map<AssetTag, Asset> = new Map([
  [AssetTag.USDB, new Asset(AssetClass.USDb, AssetName.USDb, AssetTag.USDB)],
  [AssetTag.ICX, new Asset(AssetClass.ICX, AssetName.ICX , AssetTag.ICX)],
  [AssetTag.USDC, new Asset(AssetClass.USDC, AssetName.USDC , AssetTag.USDC)],
]);



