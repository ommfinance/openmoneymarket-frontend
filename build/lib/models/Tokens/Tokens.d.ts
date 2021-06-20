export declare class Token {
    tag: string;
    name: string;
    logo: any;
    scoreAddress: string;
    balance: number;
    decimals: number;
    constructor(tag: string, name: string, logo: any, scoreAddress: string, decimals?: number, balance?: number);
}
export declare enum SupportedTokens {
    USDS = "USDS",
    ICX = "ICX",
    sICX = "sICX",
    IUSDC = "IUSDC"
}
export declare class Tokens {
    static supportedTokensMap: Map<string, Token>;
}
//# sourceMappingURL=Tokens.d.ts.map