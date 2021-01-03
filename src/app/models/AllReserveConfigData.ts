import {AssetTag} from "./Asset";
import {OmmError} from "../core/errors/OmmError";
import {ReserveConfigData} from "./ReserveConfigData";

export class AllReserveConfigData {
  sICX: ReserveConfigData;
  USDb: ReserveConfigData;

  constructor(USDb: ReserveConfigData, sICX: ReserveConfigData) {
    this.USDb = USDb;
    this.sICX = sICX;
  }

  public getReserveConfigData(assetTag: AssetTag): ReserveConfigData {
    switch (assetTag) {
      case AssetTag.ICX:
        return this.sICX;
      case AssetTag.USDb:
        return this.USDb;
      default:
        throw new OmmError(`AllReserveConfigData.getReserveConfigData: Unsupported parameter = ${assetTag}`);
    }
  }
}
