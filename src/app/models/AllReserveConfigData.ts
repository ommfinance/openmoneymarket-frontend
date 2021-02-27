import {AssetTag} from "./Asset";
import {OmmError} from "../core/errors/OmmError";
import {ReserveConfigData} from "./ReserveConfigData";

export class AllReserveConfigData {
  ICX: ReserveConfigData;
  USDb: ReserveConfigData;
  USDC: ReserveConfigData;

  constructor(USDb: ReserveConfigData, sICX: ReserveConfigData, IUSDC: ReserveConfigData) {
    this.USDb = USDb;
    this.ICX = sICX;
    this.USDC = IUSDC;
  }

  public getReserveConfigData(assetTag: AssetTag): ReserveConfigData {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.ICX;
      case AssetTag.USDb:
        return this.USDb;
      case AssetTag.USDC:
        return this.USDC;
      default:
        throw new OmmError(`AllReserveConfigData.getReserveConfigData: Unsupported parameter = ${assetTag}`);
    }
  }
}
