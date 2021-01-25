import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {Asset} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import log from "loglevel";


declare var $: any;

@Component({
  selector: 'app-asset-market',
  templateUrl: './asset-market.component.html',
  styleUrls: ['./asset-market.component.css']
})
export class AssetMarketComponent extends BaseClass implements OnInit, AfterViewInit {

  @Input() asset!: Asset;
  @Input() index!: number;

  @ViewChild("assetEl")set assetAllSetter(assetEl: ElementRef) {this.assetEl = assetEl.nativeElement; }

  assetEl: any;

  constructor(public persistenceService: PersistenceService) {
    super();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  hideAsset(): void {
    $(this.assetEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetEl).css("display", "table-row");
  }

}
