import { LitElement } from "lit-element";
import { BridgeService } from "../../lib/BridgeService";
import { User } from "../../lib/models/User/User";
declare class WithdrawElem extends LitElement {
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
    constructor();
    static styles: any[];
    protected firstUpdated(_changedProperties: any): void;
    private showModalView;
    private setActiveModalView;
    private amountChange;
    private resetFields;
    backToPaymentMethods(): void;
    private backToHomeView;
    private showConfirmWithdraw;
    private submitWithdrawal;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'withdraw-elem': WithdrawElem;
    }
}
export {};
//# sourceMappingURL=withdraw-elem.d.ts.map