import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {DataLoaderService} from "../data-loader/data-loader.service";

@Injectable({
  providedIn: 'root'
})
export class CheckerService {

  constructor(private persistenceService: PersistenceService,
              private dataLoaderService: DataLoaderService) {

  }

  public checkUserLoggedIn(): any {
    if (!this.persistenceService.iconexWallet) {
      alert("User not logged in.");
      throw new Error("User not logged in.");
    }
  }

  public checkAllAddressesLoaded(): void {
    if (!this.persistenceService.allAddresses) {
      this.dataLoaderService.loadAllScoreAddresses();
      alert("All score addresses not loaded. Try again in few moments");
      throw new Error("All score addresses not loaded.");
    }
  }

  public checkUserLoggedInAndAllAddressesLoaded(): any {
    this.checkUserLoggedIn();
    this.checkAllAddressesLoaded();
  }

}
