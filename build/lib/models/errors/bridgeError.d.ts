/**
 *  This class wraps up an external error and provides user friendly message
 * */
export declare class BridgeError extends Error {
    externalError?: any;
    userFriendlyMessage: string;
    constructor(userFriendlyMessage?: string, externalError?: any);
}
// # sourceMappingURL=bridgeError.d.ts.map
