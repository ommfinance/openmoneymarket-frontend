import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {AllAddresses} from '../../interfaces/all-addresses';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet: IconWallet | undefined;
  public allAddresses: AllAddresses | undefined;

  constructor() {
  }

  public iconexLogin(iconWallet: IconWallet): void {
    this.iconexWallet = iconWallet;
    localStorage.setItem('IconWallet', JSON.stringify(iconWallet));
  }

  public iconexLogout(): void {
    this.iconexWallet = undefined;
    localStorage.removeItem('IconWallet');
  }

  public isIconexWalletConnected(): boolean {
    return this.iconexWallet != null;
  }

}
