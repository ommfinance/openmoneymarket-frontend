import { LitElement } from "lit-element";
import { BridgeService } from "../../lib/BridgeService";
import { User } from "../../lib/models/User/User";
declare class WithdrawElem extends LitElement {
    constructor();
    static styles: any[];
    bridge: BridgeService | undefined;
    user: User | undefined;
    userBalance: number;
    private activeView;
    private withdrawAmountView;
    private withdrawConfirmationView;
    private withdrawProcessingView;
    private withdrawalSuccessView;
    private withdrawalDeclinedView;
    private amountInput;
    private amountInputError;
    spinnerTitle: string;
    private selectedPaymentMethod;
    private amount;
    private errors;
    private showModalView;
    private setActiveModalView;
    private amountChange;
    private resetFields;
    private backToHomeView;
    private showConfirmWithdraw;
    private submitWithdrawal;
    protected firstUpdated(_changedProperties: any): void;
    backToPaymentMethods(): void;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'withdraw-elem': WithdrawElem;
    }
}
export {};
// # sourceMappingURL=withdraw-elem.d.ts.map
