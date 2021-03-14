import { Injectable } from '@angular/core';
import {Subject} from "rxjs";
import {AssetAction} from "../../models/AssetAction";
import {ModalAction} from "../../models/ModalAction";
import {BridgeWallet} from "../../models/wallets/BridgeWallet";
import {IconexWallet} from "../../models/wallets/IconexWallet";
import {LedgerWallet} from "../../models/wallets/LedgerWallet";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  localStorage: Storage;
  changes$ = new Subject();

  constructor() {
    this.localStorage   = window.localStorage;
  }

  persistModalAction(modalAction: ModalAction): void {
    this.set("modal.action", modalAction);
  }

  getLastModalAction(): ModalAction {
    return this.get("modal.action");
  }

  persistWalletLogin(wallet: BridgeWallet | IconexWallet | LedgerWallet): void {
    this.set("wallet", wallet);
  }

  getLastWalletLogin(): BridgeWallet | IconexWallet | LedgerWallet {
    return this.get("wallet");
  }

  get(key: string): any {
    if (this.isLocalStorageSupported) {
      return JSON.parse(this.localStorage.getItem(key) ?? "");
    }
    return undefined;
  }

  set(key: string, value: any): boolean {
    if (this.isLocalStorageSupported) {
      this.localStorage.setItem(key, JSON.stringify(value));
      this.changes$.next({
        type: 'set',
        key,
        value
      });
      return true;
    }
    return false;
  }

  remove(key: string): boolean {
    if (this.isLocalStorageSupported) {
      this.localStorage.removeItem(key);
      this.changes$.next({
        type: 'remove',
        key
      });
      return true;
    }
    return false;
  }

  get isLocalStorageSupported(): boolean {
    return !!this.localStorage;
  }

}
