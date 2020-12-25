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
  ICX = "icx"
}

export enum AssetName {
  USDb = "Bridge Dollars",
  ICX = "ICON"
}

export enum AssetTag {
  USDb = "USDb",
  ICX = "ICX"
}

export const supportedAssetsMap: Map<AssetTag, Asset> = new Map([
  [AssetTag.USDb, new Asset(AssetClass.USDb, AssetName.USDb, AssetTag.USDb)],
  [AssetTag.ICX, new Asset(AssetClass.ICX, AssetName.ICX , AssetTag.ICX)],
]);


