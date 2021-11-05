import {AssetTag} from "./Asset";
import {OmmError} from "../core/errors/OmmError";
import {ReserveConfigData} from "./ReserveConfigData";

export class AllReserveConfigData {
  ICX: ReserveConfigData;
  USDS: ReserveConfigData;
  USDC: ReserveConfigData;
  bnUSD: ReserveConfigData;

  constructor(USDb: ReserveConfigData, sICX: ReserveConfigData, IUSDC: ReserveConfigData, bnUSD: ReserveConfigData) {
    this.USDS = USDb;
    this.ICX = sICX;
    this.USDC = IUSDC;
    this.bnUSD = bnUSD;
  }

  public getReserveConfigData(assetTag: AssetTag): ReserveConfigData {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.ICX;
      case AssetTag.USDS:
        return this.USDS;
      case AssetTag.USDC:
        return this.USDC;
      case AssetTag.bnUSD:
        return this.bnUSD;
      default:
        throw new OmmError(`AllReserveConfigData.getReserveConfigData: Unsupported parameter = ${assetTag}`);
    }
  }
}
