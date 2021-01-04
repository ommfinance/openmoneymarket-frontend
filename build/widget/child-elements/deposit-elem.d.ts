import { LitElement } from "lit-element";
import { BridgeService } from "../../lib/BridgeService";
import { User } from "../../lib/models/User/User";
declare class DepositElem extends LitElement {
    bridge: BridgeService | undefined;
    user: User | undefined;
    userBalance: number;
    private activeView;
    private depositAmountView;
    private depositConfirmationView;
    private processingView;
    private paymentSuccessView;
    private paymentDeclinedView;
    private amountInput;
    private amountInputError;
    spinnerTitle: string;
    private selectedPaymentMethod;
    private amount;
    private feeAmount;
    private totalAmount;
    private errors;
    constructor();
    static styles: any[];
    protected firstUpdated(_changedProperties: any): void;
    private showModalView;
    private setActiveModalView;
    backToPaymentMethods(): void;
    private backToHomeView;
    private amountChange;
    private resetFields;
    private clearInputFields;
    private handleError;
    private submitDeposit;
    private showConfirmSubmit;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'deposit-elem': DepositElem;
    }
}
export {};
//# sourceMappingURL=deposit-elem.d.ts.map