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

  bridge: BridgeService;

  constructor(private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService) {
    this.bridge = new BridgeService();
    window.addEventListener("bri.login", (e) => this.handleBridgeLogin(e));
    window.addEventListener("bri.widget.res", (e) => this.handleWidgetRes(e));
    window.addEventListener("bri.logout.res", (e) => this.handleWidgetLogoutRes(e));
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
    this.dispatchBridgeWidgetAction(BridgeWidgetAction.OPEN);
  }

  closeBridgeWidget(): void {
    this.dispatchBridgeWidgetAction(BridgeWidgetAction.CLOSE);
  }

  signOutUser(): void {
    this.dispatchBridgeWidgetAction(BridgeWidgetAction.LOGOUT);
  }

  private dispatchBridgeWidgetAction(action: BridgeWidgetAction): void {
    window.dispatchEvent(new CustomEvent('bri.widget', {
      detail: {
        action: action.valueOf()
      }
    }));
  }

}
