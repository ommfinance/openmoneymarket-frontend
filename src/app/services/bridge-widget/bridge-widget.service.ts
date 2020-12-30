import { Injectable } from '@angular/core';
import {OmmError} from "../../core/errors/OmmError";

// @ts-ignore
import BridgeService from "icon-bridge-sdk/build/bridge.bundle";
import {PersistenceService} from "../persistence/persistence.service";
import {BridgeWallet} from "../../models/BridgeWallet";
import {DataLoaderService} from "../data-loader/data-loader.service";

@Injectable({
  providedIn: 'root'
})
export class BridgeWidgetService {

  bridge: BridgeService;

  constructor(private dataLoaderService: DataLoaderService) {
    this.bridge = new BridgeService();
    window.addEventListener("bri.login", (e) => this.handleBridgeLogin(e));
    window.addEventListener("bri.tx.result", (e) => this.handleTxResult(e));
    window.addEventListener("bri.widget.res", (e) => this.handleWidgetRes(e));
  }

  handleBridgeLogin(e: any): void {
    const {publicAddress, email} = e.detail;
    this.dataLoaderService.walletLogin(new BridgeWallet(publicAddress, email, this.bridge), publicAddress);
  }

  handleTxResult(e: any): void{
    const {txHash, error, status} = e.detail;
    console.log(txHash, error, status);
  }

  handleWidgetRes(e: any): void {
    const error = e.detail.error;
    const successAction = e.detail.success;
    console.log("handleWidgetRes:", e);
  }

  getUserBridgeAddress(): string {
    const userBridgeAddress = localStorage.getItem("BRIDGE_USER_ICON_ADDRESS");
    if (!userBridgeAddress) {
      throw new OmmError("No Bridge user Icon address found.");
    }
    return userBridgeAddress;
  }

  getUserBridgeEmail(): string {
    const userBridgeEmail = localStorage.getItem("BRIDGE_USER_ICON_EMAIL");
    if (!userBridgeEmail) {
      throw new OmmError("No Bridge user email found.");
    }
    return userBridgeEmail;
  }

  openBridgeWidget(): void {
    window.dispatchEvent(new CustomEvent('bri.widget', {
      detail: {
        action: "open"
      }
    }));
  }

  closeBridgeWidget(): void {
    window.dispatchEvent(new CustomEvent('bri.widget', {
      detail: {
        action: "close"
      }
    }));
  }
}
