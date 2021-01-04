import { LitElement } from "lit-element";
import { BridgeService } from "../../lib/BridgeService";
import { User } from "../../lib/models/User/User";
import { BankAccount } from "../../lib/models/bankAccount/BankAccount";
import "./withdraw-elem";
import "./deposit-elem";
import { CreditCard } from "../../lib/models/CreditCard/CreditCard";
declare class PaymentMethodsElem extends LitElement {
    bridge: BridgeService | undefined;
    user: User | undefined;
    userBalance: number | undefined;
    paymentMethodsView: HTMLElement | null | undefined;
    private depositElem;
    private withdrawElem;
    private paymentOptionsTypeView;
    private paymentRemoveView;
    private errorView;
    private previousView;
    private plaidLinkScriptLoaded;
    private activeView;
    private error;
    private linkedBankAccounts;
    private linkedCreditCards;
    private selectedPaymentMethod;
    private selectedAction;
    private creditCardWidget;
    private creditCardModalView;
    private processingRemoveView;
    private loadingBankAccountView;
    private creditCardWidgetReady;
    private creditCardWidgetLoaded;
    private activeCreditCardResourceId;
    constructor();
    static styles: any[];
    protected firstUpdated(_changedProperties: any): void;
    protected updated(_changedProperties: any): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handlePlaidLinkOnEvent;
    private bankAccountAddedHandler;
    private creditCardAddedHandler;
    private creditCardWidgetReadyHandler;
    private creditCardUiLoadedHandler;
    private showModalView;
    private setActiveModalView;
    private creditCardWidgetBack;
    private onCreditCardWidgetLeave;
    private handleError;
    showPreviousPaymentMethod(): void;
    isPaymentMethodActive(paymentMethod: CreditCard | BankAccount): boolean;
    showAddPaymentMethodView(): void;
    showPlaidLink(modal?: HTMLElement | null | undefined): Promise<void>;
    private showCreditCardWidget;
    private getAndDisplayVerificationCode;
    backToHomeView(): void;
    private handleOnPaymentMethodClick;
    private handleRemovePaymentMethodClick;
    private removePaymentMethod;
    insertPlaidLinkFrontEndScript(): HTMLScriptElement | undefined;
    insertPrimeTrustFrontEndScript(): HTMLScriptElement | undefined;
    render(): import("lit-element").TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'payment-methods-elem': PaymentMethodsElem;
    }
}
export {};
//# sourceMappingURL=payment-methods.d.ts.map