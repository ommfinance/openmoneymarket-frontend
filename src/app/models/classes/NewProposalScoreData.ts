import {IParamInput} from "../Interfaces/IParamInput";

export class NewProposalScoreData {
    selectedContract?: string;
    selectedMethod?: string;
    selectedContractMethods: string[];
    parametersMap: Map<string, IParamInput>;    // param name -> param

    constructor() {
        this.selectedContract = undefined;
        this.selectedMethod = undefined;
        this.selectedContractMethods = [];
        this.parametersMap = new Map<string, IParamInput>();
    }
}
