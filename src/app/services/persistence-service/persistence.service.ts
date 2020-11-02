import { Injectable } from '@angular/core';
import {IconWallet} from '../../models/IconWallet';
import {MockScoreService} from '../mock-score/mock-score.service';

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  public iconexWallet: IconWallet | undefined;

  public USDbScoreAddress: string;
  public lendingPoolScoreAddress: string;

  constructor(private mockScoreService: MockScoreService) {
    const allAddresses = this.mockScoreService.getAllAddresses();
    this.USDbScoreAddress = allAddresses.collateral.USDb;
    this.lendingPoolScoreAddress = allAddresses.systemContract.LendingPool;
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

  public loadScoreAddresses(): void {
    const allAddresses = this.mockScoreService.getAllAddresses();
    this.USDbScoreAddress = allAddresses.collateral.USDb;
    this.lendingPoolScoreAddress = allAddresses.systemContract.LendingPool;
  }

}
