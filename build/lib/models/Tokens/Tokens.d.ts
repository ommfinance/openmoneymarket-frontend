export declare class Token {
    tag: string;
    name: string;
    logo: any;
    scoreAddress: string;
    balance: number;
    constructor(tag: string, name: string, logo: any, scoreAddress: string, balance?: number);
}
export declare enum SupportedTokens {
    USDS = "USDS",
    ICX = "ICX"
}
export declare class Tokens {
    static supportedTokensMap: Map<string, Token>;
}
//# sourceMappingURL=Tokens.d.ts.map