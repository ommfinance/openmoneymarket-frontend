import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {AllAddresses} from '../../interfaces/all-addresses';
import {AllReserves} from "../../interfaces/AllReserves";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet: IconWallet | undefined;
  public allAddresses: AllAddresses | undefined;
  public allReserves: AllReserves | undefined;

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
