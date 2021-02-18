import {Injectable} from '@angular/core';
import {OmmError} from "../../core/errors/OmmError";

// @ts-ignore
import BridgeService from "../../../../build/bridge.bundle";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {DataLoaderService} from "../data-loader/data-loader.service";
import log from "loglevel";
import {BridgeWidgetAction} from "../../models/BridgeWidgetAction";
import {NotificationService} from "../notification/notification.service";

@Injectable({
  providedIn: 'root'
})
export class BridgeWidgetService {

  constructor(private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService) {
    this.bridge = new BridgeService();
    window.addEventListener("bri.login", (e) => this.handleBridgeLogin(e));
    window.addEventListener("bri.widget.res", (e) => this.handleWidgetRes(e));
    window.addEventListener("bri.logout.res", (e) => this.handleWidgetLogoutRes(e));
    window.addEventListener("bri.deposit", () => this.handleBridgeUserBalanceAction());
    window.addEventListener("bri.withdraw", () => this.handleBridgeUserBalanceAction());
  }

  bridge: BridgeService;

  private static dispatchBridgeWidgetAction(action: BridgeWidgetAction): void {
    const event = new CustomEvent('bri.widget', {
      detail: {
        action: action.valueOf()
      }
    });
    log.debug("Dispatched Bridge event: ", event);
    window.dispatchEvent(event);
  }

  handleBridgeLogin(e: any): void {
    const {publicAddress, email} = e.detail;
    log.debug("Bridge login with publicAddress=" + publicAddress);
    this.dataLoaderService.walletLogin(new BridgeWallet(publicAddress, email, this.bridge));
  }

  sendTransaction(tx: any): void {
    log.debug(`Bridge sendTransaction tx:`, tx);
    window.dispatchEvent(new CustomEvent('bri.send.tx', {
      detail: {
        payload: tx
      }
    }));
  }

  // when user trigger balance changing action in Bridge (deposit, withdraw, send) update his balances
  handleBridgeUserBalanceAction(): void {
    this.dataLoaderService.loadAllUserAssetsBalances();
  }

  handleWidgetLogoutRes(e: any): void {
    const publicAddress: string = e.detail.publicAddress;
    const email: string = e.detail.email;
    const error: string = e.detail.error;

    if (error) {
      throw new OmmError(error);
    }

    this.notificationService.showNewNotification("Successfully logged out.");
  }

  handleWidgetRes(e: any): void {
    const error: string = e.detail.error;
    const action: BridgeWidgetAction = e.detail.success;

    if (error) {
      throw new OmmError(error);
    }
  }

  getUserBridgeAddress(): string {
    const userBridgeAddress = localStorage.getItem("BRIDGE_USER_ICON_ADDRESS");
    if (!userBridgeAddress) {
      throw new OmmError("Unable to retrieve Bridge Icon address from the localstorage.");
    }
    return userBridgeAddress;
  }

  getUserBridgeEmail(): string {
    const userBridgeEmail = localStorage.getItem("BRIDGE_USER_ICON_EMAIL");
    if (!userBridgeEmail) {
      throw new OmmError("Unable to retrieve Bridge email from the localstorage.");
    }
    return userBridgeEmail;
  }

  openBridgeWidget(): void {
    BridgeWidgetService.dispatchBridgeWidgetAction(BridgeWidgetAction.OPEN);
  }

  closeBridgeWidget(): void {
    BridgeWidgetService.dispatchBridgeWidgetAction(BridgeWidgetAction.CLOSE);
  }

  signOutUser(): void {
    BridgeWidgetService.dispatchBridgeWidgetAction(BridgeWidgetAction.LOGOUT);
  }

}
