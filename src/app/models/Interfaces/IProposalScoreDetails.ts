import {IScoreParameterValue} from "./IScoreParameter";

export interface IProposalScoreDetails {
  address: string,
  name: string,
  method: string,
  parameters: IScoreParameterValue[]
}
