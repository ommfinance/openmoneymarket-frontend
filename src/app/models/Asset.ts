import log from "loglevel";

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
  ICX = "icx",
  USDS = "usds",
  USDC = "usdc"
}

export enum AssetName {
  ICX = "ICON",
  USDS = "Stably USD",
  USDC = "ICON USD Coin"
}

export class AssetTag {
  static ICX = "ICX";
  static USDS = "USDS";
  static USDC = "IUSDC";

  static fromString(value: string): AssetTag {
    if (value === "sICX") {
      value = "ICX";
    } else if (value === "IUSDC") {
      value = "USDC";
    }

    return AssetTag[value as keyof typeof AssetTag];
  }

  /** construct AssetTag from pool name by parsing quote asset (base asset is always OMM) */
  static constructFromPoolPairName(name: string): AssetTag | undefined {
    const splitString = name?.replace(" ", "").replace(/[0-9]/g, '').split("/")
      ?? ["", ""];
    return this.fromString(splitString[1]);
  }
}

export class CollateralAssetTag {
  static USDS = "USDS";
  static sICX = "sICX";
  static USDC = "IUSDC";

  public static getPropertiesDifferentThanAssetTag(): CollateralAssetTag[] {
    return Object.values(CollateralAssetTag).filter(collateralAssetTag =>  !(Object.values(AssetTag).includes(collateralAssetTag)));
  }
}

export function assetToCollateralAssetTag(assetTag: AssetTag): CollateralAssetTag {
  switch (assetTag) {
    case AssetTag.ICX:
      return CollateralAssetTag.sICX;
    case AssetTag.USDC:
      return CollateralAssetTag.USDC;
    case AssetTag.USDS:
      return CollateralAssetTag.USDS;
    default:
      throw new Error("Invalid AssetTag provided to assetToCollateralAssetTag method!");
  }
}

export const supportedAssetsMap: Map<AssetTag, Asset> = new Map([
  [AssetTag.ICX, new Asset(AssetClass.ICX, AssetName.ICX , AssetTag.ICX)],
  [AssetTag.USDS, new Asset(AssetClass.USDS, AssetName.USDS, AssetTag.USDS)],
  [AssetTag.USDC, new Asset(AssetClass.USDC, AssetName.USDC , AssetTag.USDC)],
]);



