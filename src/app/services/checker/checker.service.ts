import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {OmmError} from "../../core/errors/OmmError";

@Injectable({
  providedIn: 'root'
})
export class CheckerService {

  constructor(private persistenceService: PersistenceService) {

  }

  public checkUserLoggedIn(): any {
    if (!this.persistenceService.activeWallet) {
      throw new OmmError("User not logged in.", );
    }
  }

  public checkAllAddressesLoaded(): void {
    if (!this.persistenceService.allAddresses) {
      throw new OmmError("All score addresses not loaded.");
    }
  }

  public checkUserLoggedInAndAllAddressesLoaded(): any {
    this.checkUserLoggedIn();
    this.checkAllAddressesLoaded();
  }

}
