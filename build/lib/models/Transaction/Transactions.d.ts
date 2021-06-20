import { BridgeTransaction } from "./BridgeTransaction";
import { IcxTransaction } from "./IcxTransaction";
import { Irc2TokenTransaction } from './Irc2TokenTransaction';
export declare class Transactions {
    bridgeTransactions: BridgeTransaction[];
    icxTransactions: IcxTransaction[];
    iusdcTransactions: Irc2TokenTransaction[];
    sicxTransactions: Irc2TokenTransaction[];
    constructor(bridgeTransactions: BridgeTransaction[], icxTransactions: IcxTransaction[], iusdcTransactions: Irc2TokenTransaction[], sicxTransactions: Irc2TokenTransaction[]);
}
//# sourceMappingURL=Transactions.d.ts.map