import { TransactionType } from "./BridgeTransaction";
export interface TransactionObj {
    version: string;
    from: string;
    to: string;
    data: object;
    dataType: string;
    timestamp: string;
    nid: string;
    nonce: string;
}
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
export declare class Irc2ParamsObj {
    _to: string;
    _value: string;
    _data?: string | undefined;
    constructor(to: string, value: string, data?: string | undefined);
}
//# sourceMappingURL=Irc2TokenTransaction.d.ts.map