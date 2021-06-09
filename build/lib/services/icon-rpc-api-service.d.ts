import { MagicUserMetadata } from "magic-sdk";
export declare function sendIrc2Token(magic: any, address: string, scoreAddress: string, amount: number, data: string | undefined, IconBuilder: any, IconAmount: any, IconConverter: any, magicUserMetadata: MagicUserMetadata | undefined): Promise<string>;
export declare function sendIcxTokens(magic: any, to: string, amount: number, IconBuilder: any, IconAmount: any, IconConverter: any, magicUserMetadata: MagicUserMetadata | undefined): Promise<string>;
export declare function getIcxBalance(address: string | null, IconSDK: any): Promise<number>;
export declare function getIrc2TokenBalance(address: string, scoreAddress: string, IconBuilder: any, IconSDK: any): Promise<number>;
export declare function buildWithdrawalRequestTransaction(from: string, amount: number, IconBuilder: any, IconAmount: any, IconConverter: any): any;
//# sourceMappingURL=icon-rpc-api-service.d.ts.map