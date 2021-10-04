import {Injectable} from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {IconexApiService} from "../iconex-api/iconex-api.service";
import {BridgeWidgetService} from "../bridge-widget/bridge-widget.service";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";
import {LedgerService} from "../ledger/ledger.service";
import {NotificationService} from "../notification/notification.service";
import {IconApiService} from "../icon-api/icon-api.service";
import {IconConverter} from "icon-sdk-js";
import {TransactionResultService} from "../transaction-result/transaction-result.service";
import {LocalStorageService} from "../local-storage/local-storage.service";
import {IconexId} from "../../models/IconexId";
import log from "loglevel";
import BigNumber from "bignumber.js";
import {ModalAction} from "../../models/ModalAction";
import {ModalType} from "../../models/ModalType";
import {ProposalLink} from "../../models/ProposalLink";
import {ScoreService} from "../score/score.service";

@Injectable({
  providedIn: 'root'
})
export class TransactionDispatcherService {

  constructor(
    private persistenceService: PersistenceService,
    private iconexApiService: IconexApiService,
    private bridgeWidgetService: BridgeWidgetService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private iconApiService: IconApiService,
    private transactionResultService: TransactionResultService,
    private localStorageService: LocalStorageService,
    private scoreService: ScoreService) { }

  /**
   * Method that dispatches the built tx to Icon network (through Iconex, Bridge or directly) and triggers the proper notification
   */
  async dispatchTransaction(tx: any, notificationMessage: string): Promise<void> {
    try {
      const estimatedStepCost = await this.iconApiService.estimateStepCost(IconConverter.toRawTransaction(tx));

      log.debug("Estimated cost for ", tx, " is ", estimatedStepCost);

      if (estimatedStepCost) {
        tx.stepLimit = this.iconApiService.convertNumberToHex(estimatedStepCost.multipliedBy(new BigNumber("1.3")));
      }

      // get last modal action from localstorage
      const modalAction: ModalAction = this.localStorageService.getLastModalAction()!!;

      // handle create proposal link creation
      if (modalAction.modalType === ModalType.SUBMIT_PROPOSAL) {
        const proposal = modalAction.governanceAction?.newProposal!;
        const proposalLink = new ProposalLink(proposal.forumLink, proposal.title);

        // save forum link with title FIXME: adjust after SCORE change
        try {
          await this.scoreService.saveProposalLinks(proposalLink).toPromise();
          log.debug("Successfully created proposal link:", proposalLink);
        } catch (e) {
          this.notificationService.showNewNotification("Couldn't submit proposal. Failed to store the forum link.");
          log.error(e);
          throw e;
        }
      }

      if (this.persistenceService.activeWallet instanceof IconexWallet) {
        this.iconexApiService.dispatchSendTransactionEvent(tx, IconexId.SHOW_MESSAGE_HIDE_MODAL);
        this.notificationService.setNotificationToShow(notificationMessage);
      } else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
        this.bridgeWidgetService.sendTransaction(tx);
        this.notificationService.showNewNotification(notificationMessage);
      } else if (this.persistenceService.activeWallet instanceof LedgerWallet) {
        try {
          const signedRawTx = await this.ledgerService.signTransaction(IconConverter.toRawTransaction(tx));
          this.notificationService.showNewNotification(notificationMessage);

          const txHash = await this.iconApiService.sendTransaction({
            getProperties: () => signedRawTx,
            getSignature: () => signedRawTx.signature,
          });

          this.transactionResultService.processIconTransactionResult(txHash);
        } catch (e) {
          if (modalAction.modalType === ModalType.SUBMIT_PROPOSAL) {
            // delete proposal link if it fails to be submitted
            const title = modalAction.governanceAction?.newProposal?.title ?? "";
            this.scoreService.deleteProposalLink(title).subscribe(
              (res) => log.error("Successfully deleted proposal " + title),
              (error => log.error(error)
              ));
          }
        }
      }
    } catch (e) {
      this.transactionResultService.showFailedActionNotification(e?.message ?? "", this.localStorageService.getLastModalAction());
    }
  }

}
