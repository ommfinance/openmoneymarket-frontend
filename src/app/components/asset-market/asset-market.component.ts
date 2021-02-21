import {AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {BaseClass} from "../base-class";
import {Asset, AssetTag} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {ModalType} from "../../models/ModalType";
import {ModalService} from "../../services/modal/modal.service";

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

  marketExpandedEl: any;
  @ViewChild("marketExpandedEl")set f(marketExpandedEl: ElementRef) {this.marketExpandedEl = marketExpandedEl.nativeElement; }

  @Output() collOtherAssetTables = new EventEmitter<AssetTag>();

  assetEl: any;

  constructor(public persistenceService: PersistenceService,
              public modalService: ModalService) {
    super(persistenceService);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  onSignInClick(): void {
    this.collapseAssetTableSlideUp();
    this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  /**
   * Asset expand logic
   */
  onAssetClick(): void {
    // only expand if user is logged out
    if (this.persistenceService.userLoggedIn()) {
      return;
    }

    /** Layout */

    if (this.index === 0) {
      // Expand asset table
      $(this.assetEl).toggleClass('active');
      $(this.marketExpandedEl).slideToggle();
    }

    // Collapse other assets table
    this.collOtherAssetTables.emit(this.asset.tag);

    if (this.index !== 0) {
      $(this.assetEl).toggleClass('active');
      $(this.marketExpandedEl).slideToggle();
    }
  }

  collapseAssetTableSlideUp(): void {
    // Collapse asset-user table`
    $(this.assetEl).removeClass('active');
    $(this.marketExpandedEl).slideUp();
  }

  hideAsset(): void {
    $(this.assetEl).css("display", "none");
  }

  showAsset(): void {
    $(this.assetEl).css("display", "table-row");
  }

}
