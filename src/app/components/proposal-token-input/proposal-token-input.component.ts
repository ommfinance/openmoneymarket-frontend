import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Asset} from "../../models/classes/Asset";
import BigNumber from "bignumber.js";
import {Utils} from "../../common/utils";
import {PersistenceService} from "../../services/persistence/persistence.service";

@Component({
  selector: 'app-proposal-token-input',
  templateUrl: './proposal-token-input.component.html'
})
export class ProposalTokenInputComponent implements OnInit {

  @Input() asset!: Asset;

  @Output() inputChange = new EventEmitter<string>();

  constructor(private persistenceService: PersistenceService) { }

  ngOnInit(): void {
  }

  onInputChange(e: Event) {
    this.inputChange.emit(this.transformValueToDecimalized(e));
  }



  transformValueToDecimalized(e: any): string {
    const value = +e.target.value.toString();
    const decimals = this.persistenceService.getDecimalsForReserve(this.asset.tag);

    if (!decimals) throw new Error(`[transformValueToDecimalized] Decimals for ${this.asset.tag} undefined!`);

    return Utils.normalisedAmountToBaseAmountString(new BigNumber(value), decimals);
  }

}
