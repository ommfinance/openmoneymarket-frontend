import { TransactionType } from "./BridgeTransaction";
export declare class IcxTransactions {
    data: IcxTransaction[];
    constructor(data: IcxTransaction[]);
}
export declare class IcxTransaction {
    amount: number;
    createDate: string;
    dataType: string;
    fromAddr: string;
    state: number;
    toAddr: string;
    txHash: string;
    txType: string;
    dateString: string;
    date: Date;
    type: TransactionType;
    constructor(amount: number, createDate: string, dataType: string, fromAddr: string, state: number, toAddr: string, txHash: string, txType: string, dateString?: string, date?: Date, type?: TransactionType);
}
//# sourceMappingURL=IcxTransactions.d.ts.map