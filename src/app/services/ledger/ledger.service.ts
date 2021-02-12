import { Injectable } from '@angular/core';
// @ts-ignore
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import log from "loglevel";
import {LedgerIcxBaseData} from "../../interfaces/LedgerIcxBaseData";
import {Icx} from "../../libs/hw-app-icx/Icx";
import {OmmError} from "../../core/errors/OmmError";
import {NotificationService} from "../notification/notification.service";


@Injectable({
  providedIn: 'root'
})
export class LedgerService {

  constructor(private notificationService: NotificationService) { }

  async signIn(): Promise<LedgerIcxBaseData | undefined> {

    if (!TransportWebUSB.isSupported) {
      // alert("Unable to connect the ledger. WebUSB transport is not supported.");
      this.notificationService.showNewNotification("Unable to connect the ledger. WebUSB transport is not supported.");
    }

    try {
      const transport = await TransportWebUSB.create();
      transport.setDebugMode(true);
      transport.setExchangeTimeout(60000);

      const icx = new Icx(transport);

      this.notificationService.showNewNotification("Waiting for the confirmation of address on Ledger device..");
      // coin type: ICX(4801368), ICON testnet(1)
      const result = await icx.getAddress("44'/4801368'/0'/0'", true, true);

      return result;
    } catch (e) {
      this.notificationService.showNewNotification("Unable to connect the ledger. Make sure it is connected and try again in few moments.");
      log.error("Error in TransportWebUSB... :");
      log.error(e);
      return undefined;
    }
  }
}
