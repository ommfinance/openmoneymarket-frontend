import {ScoreParamType, ScorePayloadParamType} from "../enums/ScoreParamType";

export interface IScoreParameter {
  default?: any,
  name: string,
  type: ScoreParamType
}

export interface IScoreParameterValue extends IScoreParameter {
  value: string;
}

export interface IScorePayloadParameter {
  type: ScorePayloadParamType;
  value: string;
}

export function scorePayloadParameterToString(params: IScorePayloadParameter[]): string {
  const res = "";
  params.forEach(param => res + param.type.toString() + param.value);
  return res;
}

export function scoreParamToPayloadParam(param: ScoreParamType): ScorePayloadParamType {
  switch (param) {
    case "int":
      return ScorePayloadParamType.BIG_INTEGER;
    case ScoreParamType.ADDRESS:
      return ScorePayloadParamType.ADDRESS;
    case ScoreParamType.BYTES:
      return ScorePayloadParamType.BYTES
    default:
      throw new Error("Unsupported ScoreParamType!");
  }
}
