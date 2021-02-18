import { TransactionType } from "./BridgeTransaction";
export declare class Irc2TokenTransaction {
    txHash: string;
    contractAddr: string;
    contractName: string;
    contractSymbol: string;
    unit: string;
    createDate: string;
    fromAddr: string;
    toAddr: string;
    quantity: string;
    ircVersion: string;
    state: number;
    type: TransactionType | undefined;
    constructor(txHash: string, contractAddr: string, contractName: string, contractSymbol: string, unit: string, createDate: string, fromAddr: string, toAddr: string, quantity: string, ircVersion: string, state: number, type?: TransactionType);
}
//# sourceMappingURL=Irc2TokenTransaction.d.ts.map