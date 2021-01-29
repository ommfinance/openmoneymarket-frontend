import { NaturalPersonContactUS } from "../models/PrimeTrust/NaturalPersonContactUS";
import { BankAccount } from "../models/bankAccount/BankAccount";
import { CreditCard } from "../models/CreditCard/CreditCard";
export declare function icxValueToNormalValue(icxValue: number): number;
export declare function parseHexToNumber(value: string | number): number;
export declare function instanceOfNaturalPersonContactUS(object: any): object is NaturalPersonContactUS;
export declare function extractDidEthAddress(issuer: string | null): string;
export declare function extractFileExtension(file: string | File): string;
export declare function stringToDateString(date: string): string;
export declare function calculateCredCardTotalAmount(amount: number): number;
export declare function calculateCreditCardFee(amount: number): number;
export declare function roundUpToTwoDecimals(number: number): number;
export declare function extractMessageFromError(error: any): string;
export declare function extractDetailMessageFromError(error: any): string;
export declare function log(message: any, ...args: any): void;
export declare function isBankAccount(selectedPaymentMethod: BankAccount | CreditCard): boolean;
export declare function extractPaymentMethodName(selectedPaymentMethod: BankAccount | CreditCard): string;
export declare function numberWithCommas(amount: string): string;
//# sourceMappingURL=Utils.d.ts.map