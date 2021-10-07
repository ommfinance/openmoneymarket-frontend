import { AxiosInstance } from 'axios';
export declare class BackendLogger {
    axios: AxiosInstance;
    browser: string;
    constructor();
    private detectBrowser;
    postError(title: string, errorCode: number | undefined, errorMsg: string, walletAddr?: string): Promise<void>;
}
declare const _default: BackendLogger;
export default _default;
declare global {
    interface Document {
        documentMode?: any;
    }
}
//# sourceMappingURL=errorLogger.d.ts.map