import {AssetTag} from "./Asset";
import {OmmError} from "../core/errors/OmmError";
import {ReserveConfigData} from "./ReserveConfigData";

export class AllReserveConfigData {
  ICX: ReserveConfigData;
  USDS: ReserveConfigData;
  USDC: ReserveConfigData;

  constructor(USDb: ReserveConfigData, sICX: ReserveConfigData, IUSDC: ReserveConfigData) {
    this.USDS = USDb;
    this.ICX = sICX;
    this.USDC = IUSDC;
  }

  public getReserveConfigData(assetTag: AssetTag): ReserveConfigData {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.ICX;
      case AssetTag.USDS:
        return this.USDS;
      case AssetTag.USDC:
        return this.USDC;
      default:
        throw new OmmError(`AllReserveConfigData.getReserveConfigData: Unsupported parameter = ${assetTag}`);
    }
  }
}
