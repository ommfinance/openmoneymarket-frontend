import {IScorePayloadParameter} from "./IScoreParameter";

export interface IProposalTransactions {
  address: string,
  method: string,
  parameters: IScorePayloadParameter[]
}
