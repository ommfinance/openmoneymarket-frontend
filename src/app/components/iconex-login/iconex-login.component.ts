import {Component, OnDestroy, OnInit} from '@angular/core';
import {environment} from "../../../environments/environment";
import {IconApiService} from "../../services/icon-api-service/icon-api.service";
import {PersistenceService} from "../../services/persistence.service";
import {IconWallet} from "../../models/IconWallet";


@Component({
  selector: 'app-iconex-login',
  templateUrl: './iconex-login.component.html',
  styleUrls: ['./iconex-login.component.css']
})
export class IconexLoginComponent implements OnInit, OnDestroy {

  /*
  * https://www.icondev.io/docs/chrome-extension-connect
  */

  private attachedListener: boolean

  constructor(private iconApiService: IconApiService,
              public persistenceService: PersistenceService) {
    window.addEventListener('ICONEX_RELAY_RESPONSE', (e:any) => this.iconexEventHandler(e));
    this.attachedListener = true;
  }

  ngOnInit(): void {
    if (!this.attachedListener){
      window.addEventListener('ICONEX_RELAY_RESPONSE', (e:any) => this.iconexEventHandler(e));
    }
  }

  ngOnDestroy(): void {
    if (this.attachedListener){
      window.removeEventListener('ICONEX_RELAY_RESPONSE', (e:any) => this.iconexEventHandler(e));
      this.attachedListener = true;
    }
  }

  onConnectWalletClick() {
    this.hasAccount();
  }

  private iconexEventHandler( e: any) {
    const {type, payload} = e.detail;

    if (!environment.production)
      console.log(type, " : ", payload)

    switch (type) {
      case "RESPONSE_HAS_ACCOUNT": {
        if (payload.hasAccount) this.requestAddress();
        else alert("Wallet does not exist. (Not logged in Iconex?)");
        break;
      }
      case "RESPONSE_ADDRESS": {
        this.iconApiService.getIcxBalance(payload).then((result: number) => {
          if (!environment.production) console.log("Balances: ", result);
          this.persistenceService.iconexLogin(new IconWallet(payload, result))
        }).catch( err => console.error(err))
        alert("Successfully connected your Icon wallet!");
        break;
      }
      case "RESPONSE_JSON-RPC": {
        console.log(payload.result,"SCORE transaction", "Pending transaction.")
        break;
      }
      default: {
        console.log(type);
        console.log(payload);
        break;
      }
    }
  }

  /*
    REQUEST_HAS_ACCOUNT Requests for whether iconex has any icon wallet.
    Returns boolean-typed result in event.
   */
  hasAccount() {
    this.dispatchIconexEvent("REQUEST_HAS_ACCOUNT", null)
  }

  /*
    REQUEST_ADDRESS Requests for the address to use for service.
   */
  private requestAddress() {
    this.dispatchIconexEvent("REQUEST_ADDRESS", null)
  }

  dispatchIconexEvent(requestType: string, payload: any) {
    window.dispatchEvent(new CustomEvent('ICONEX_RELAY_REQUEST', {
      detail: {
        type: requestType,
        payload: payload
      }}));
  }


}
