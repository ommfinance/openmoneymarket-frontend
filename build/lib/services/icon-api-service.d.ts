import { AxiosResponse } from "axios";
export declare class IconApiService {
    private axios;
    constructor();
    /**
     * @description Get all token transactions of address
     * @param {string} address - ICON address to check
     * @param {number} page - number of the page for pagination
     * @param {number} count - number of the results to fetch per page
     * @return {Promise<AxiosResponse>} Promise with list of transactions from "https://bicon.tracker.solidwallet.io/v3"
     * @throws {BridgeError} - contains user friendly message from the API and external error
     */
    getTokenTransactions(address: string, page?: number, count?: number): Promise<AxiosResponse>;
    /**
     * @description Get ICX transactions of the address
     * @param {string} address - ICON address to check
     * @param {number} page - number of the page for pagination
     * @param {number} count - number of the results to fetch per page
     * @return {Promise<AxiosResponse>} Promise with list of transactions from "https://bicon.tracker.solidwallet.io/v3"
     * @throws {BridgeError} - contains user friendly message from the API and external error
     */
    getIcxTransactions(address: string, page?: number, count?: number): Promise<AxiosResponse>;
}
// # sourceMappingURL=icon-api-service.d.ts.map
