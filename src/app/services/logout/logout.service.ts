import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {StateChangeService} from "../state-change/state-change.service";
import {BridgeWidgetAction} from "../../models/BridgeWidgetAction";
import {Utils} from "../../common/utils";


/**
 * A service that deals with Logout logic.
 */
@Injectable({
  providedIn: 'root'
})
export class LogoutService {

  constructor(
    private persistenceService: PersistenceService,
    private stateChangeService: StateChangeService
  ) { }

  signOutUser(): void {
    // if Bridge wallet commit request to Bridge to sign out
    if (this.persistenceService.bridgeWalletActive()) {
      this.signOutBridgeUser();
    }

    // clear active wallet
    this.persistenceService.logoutUser();

    // commit change to the state change service
    this.stateChangeService.updateLoginStatus(this.persistenceService.activeWallet);
  }

  private signOutBridgeUser(): void {
    Utils.dispatchBridgeWidgetAction(BridgeWidgetAction.LOGOUT);
  }
}
