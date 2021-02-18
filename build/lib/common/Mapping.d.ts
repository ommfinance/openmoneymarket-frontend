import { Irc2TokenTransaction } from "../models/Transaction/Irc2TokenTransaction";
import { BridgeTransaction } from "../models/Transaction/BridgeTransaction";
import { Deposit } from "../models/Transaction/Deposit";
import { Withdrawal } from "../models/Transaction/Withdrawal";
import { BankAccount } from "../models/bankAccount/BankAccount";
import { CreditCard } from "../models/CreditCard/CreditCard";
import { IcxTransaction, IcxTransactions } from "../models/Transaction/IcxTransactions";
import { UserKycData } from "../models/Account/UserKycData";
export declare function formatAndFilterIcxTransactions(icxTransactions: IcxTransactions, userIconWalletAddress: string): IcxTransaction[];
export declare function formatAndFilterBridgeTransactions(iconTokenTransactions: Irc2TokenTransaction[] | undefined, deposits: Deposit[] | undefined, userIconWalletAddress: string, withdrawals: Withdrawal[] | undefined): BridgeTransaction[];
export declare function mapFundsTransferMethodToBank(fundsTransferMethod: any): BankAccount;
export declare function mapFundsTransferMethodToCreditCard(fundsTransferMethod: any): CreditCard;
export declare function transactionTypeToClass(transaction: BridgeTransaction): string;
export declare function tokenTransactionTypeToClass(transaction: IcxTransaction): "deposited" | "sent";
export declare function getTransactionName(transaction: BridgeTransaction): string;
export declare function getKycStatusTitle(userKycData: UserKycData | undefined, title?: string): "Not verified" | "Verifying" | "Verified";
export declare function getKycStatusClass(title: string, userKycData: UserKycData | undefined): "not-verified" | "verifying" | "";
export declare function getKycFailureMessage(errorMessage: string, country: string | undefined): string;
//# sourceMappingURL=Mapping.d.ts.map