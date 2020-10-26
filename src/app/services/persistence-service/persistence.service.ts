import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public connectedIconWallet: IconWallet | undefined;

  constructor() { }

  public iconexLogin(iconWallet: IconWallet): void {
    this.connectedIconWallet = iconWallet;
    localStorage.setItem('IconWallet', JSON.stringify(iconWallet));
  }

  public iconexLogout(): void {
    this.connectedIconWallet = undefined;
    localStorage.removeItem('IconWallet');
  }

  public isIconexWalletConnected(): boolean {
    return this.connectedIconWallet !== undefined;
  }

}