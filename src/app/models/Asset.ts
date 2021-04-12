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

export enum AssetTag {
  USDB = "USDB",
  ICX = "ICX",
  USDC = "IUSDC"
}

export const supportedAssetsMap: Map<AssetTag, Asset> = new Map([
  [AssetTag.USDB, new Asset(AssetClass.USDb, AssetName.USDb, AssetTag.USDB)],
  [AssetTag.ICX, new Asset(AssetClass.ICX, AssetName.ICX , AssetTag.ICX)],
  [AssetTag.USDC, new Asset(AssetClass.USDC, AssetName.USDC , AssetTag.USDC)],
]);



