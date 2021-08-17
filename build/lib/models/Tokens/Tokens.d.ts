import BigNumber from "bignumber.js";
export declare class Token {
    tag: SupportedTokens;
    name: string;
    logo: any;
    scoreAddress: string;
    balance: number;
    decimals: number;
    usdBalance: number | '-';
    constructor(tag: SupportedTokens, name: string, logo: any, scoreAddress: string, decimals?: number, balance?: number, usdBalance?: number | '-');
}
export declare enum SupportedTokens {
    USDS = "USDS",
    ICX = "ICX",
    sICX = "sICX",
    IUSDC = "IUSDC",
    OMM = "OMM"
}
export declare enum OracleTokenNames {
    USDS = "USDS",
    IUSDC = "USDC",
    ICX = "ICX",
    sICX = "sICX",
    OMM = "OMM",
    USD = "USD"
}
export declare class Tokens {
    static supportedTokensMap: Map<string, Token>;
}
export interface TokenRates {
    USDS: BigNumber | '-';
    IUSDC: BigNumber | '-';
    sICX: BigNumber | '-';
    OMM: BigNumber | '-';
    ICX: BigNumber | '-';
}
//# sourceMappingURL=Tokens.d.ts.map