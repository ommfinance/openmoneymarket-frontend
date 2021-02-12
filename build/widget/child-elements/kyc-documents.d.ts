import { LitElement } from 'lit-element';
import { BridgeService } from "../../lib/BridgeService";
import { User } from "../../lib/models/User/User";
declare class KycDocuments extends LitElement {
    constructor();
    static styles: any[];
    bridge: BridgeService | undefined;
    user: User | undefined;
    activeView: HTMLElement | null | undefined;
    spinnerTitle: string;
    selectedDocumentType: string;
    private kycDocumentsView;
    private processingModalView;
    private kycUploadErrorView;
    private kycUploadSuccessView;
    private documentFrontSide;
    private documentBackSide;
    private documentProofOfAddress;
    private documentOther;
    private documentCountry;
    private documentType;
    errors: string[];
    private documentIdTypeChange;
    private showModalView;
    private setActiveModalView;
    private backToHomeViewEvent;
    protected firstUpdated(_changedProperties: any): void;
    submitUploadDocumentsForm(event: Event): Promise<boolean>;
    protected render(): unknown;
}
declare global {
    interface HTMLElementTagNameMap {
        'kyc-documents': KycDocuments;
    }
}
export {};
// # sourceMappingURL=kyc-documents.d.ts.map
