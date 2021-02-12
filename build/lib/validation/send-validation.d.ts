/**
 * @description Validate send Bridge tokens input fields
 * @param {string} transferAmount - Amount of the Bridge tokens to transfer
 * @param {string} transferToAddress - Icon wallet address of the recipient
 * @param {number} userBalance - Users current Bridge stable coin balance
 * @param {string} iconWalletAddress - Icon wallet address of the current user
 * @return {string[]} errors - List of error messages that occurred during the validation
 */
export declare function validateSendBridgeTokens(transferAmount: number, transferToAddress: string, userBalance: number | undefined, iconWalletAddress: string): string[];
// # sourceMappingURL=send-validation.d.ts.map
