import { MagicUserMetadata } from "magic-sdk";
import BigNumber from 'bignumber.js';
import { OracleTokenNames } from "../models/Tokens/Tokens";
export declare function sendIrc2Token(magic: any, address: string, scoreAddress: string, amount: number, decimals: number, data: string | undefined, IconBuilder: any, IconConverter: any, magicUserMetadata: MagicUserMetadata | undefined): Promise<string>;
export declare function sendIcxTokens(magic: any, to: string, amount: number, IconBuilder: any, IconAmount: any, IconConverter: any, magicUserMetadata: MagicUserMetadata | undefined): Promise<string>;
export declare function getIcxBalance(address: string | null, IconSDK: any): Promise<number>;
export declare function getIrc2TokenBalance(address: string, scoreAddress: string, IconBuilder: any, IconSDK: any): Promise<number>;
export declare function getTokenRate(IconBuilder: any, IconSDK: any, baseToken: OracleTokenNames, quoteToken: OracleTokenNames): Promise<BigNumber>;
export declare function getSicxIcxRatio(IconBuilder: any, IconSDK: any): Promise<BigNumber>;
export declare function buildWithdrawalRequestTransaction(from: string, amount: number, IconBuilder: any, IconAmount: any, IconConverter: any): any;
//# sourceMappingURL=icon-rpc-api-service.d.ts.map