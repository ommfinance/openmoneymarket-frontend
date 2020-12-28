import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';
import {BaseClass} from "../base-class";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {DepositService} from "../../services/deposit/deposit.service";

import {WithdrawService} from "../../services/withdraw/withdraw.service";
import {BorrowService} from "../../services/borrow/borrow.service";
import {SlidersService} from "../../services/sliders/sliders.service";
import {RepayService} from "../../services/repay/repay.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {HeaderComponent} from "../header/header.component";
import * as toggleLogic from "./home-toggle-logic";
import {RiskComponent} from "../risk/risk.component";
import {Asset} from "../../models/Asset";
import log from "loglevel";
import {AssetComponent} from "../asset/asset.component";

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  // Child components
  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  @ViewChild(RiskComponent) private riskComponent!: RiskComponent;
  // Asset children components
  @ViewChildren('asset') assets!: QueryList<AssetComponent>;

  searchValue = "";

  public toggleLogic = toggleLogic;

  public supportedAssets: Asset[] = Array.from(this.getSupportedAssetsMap().values());

  constructor(public persistenceService: PersistenceService,
              public depositService: DepositService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService,
              private cd: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.supportedAssets = Array.from(this.getSupportedAssetsMap().values());
    this.cd.detectChanges();
  }

  onSearchValueChange(newValue: any): void {
    this.searchValue = newValue;
    this.hideNonSearchedAssets();
  }

  hideNonSearchedAssets(): void {
    log.debug("hideNonSearchedAssets");
    this.assets.forEach(assetComponent => {
      const yourMarketsShown = !$("#toggle-your-markets").hasClass("active");
      const allMarketsShown = !$("#toggle-all-markets").hasClass("active");
      if (!assetComponent.asset.tag.toLowerCase().includes(this.searchValue.toLowerCase())) {
        if (!this.persistenceService.userLoggedIn()) {
          assetComponent.hideAllMarketAsset();
        }
        else if (yourMarketsShown) {
          assetComponent.hideYourAsset();
        }
        else if (allMarketsShown) {
          assetComponent.hideAllMarketAsset();
        }
      } else {
        if (!this.persistenceService.userLoggedIn()) {
          assetComponent.showAllMarketAsset();
        }
        else if (yourMarketsShown) {
          assetComponent.showYourAsset();
        }
        else if (allMarketsShown) {
          assetComponent.showAllMarketAsset();
        }
      }
    });
  }

  // On "All markets tab" click
  onToggleAllMarketsClick(): void {

    // if all borrowed assets are 0
    this.hideRiskIfNothinBorrowed();

    /** Toggles */

    // Show "All markets" view
    $("#toggle-all-markets").addClass('active');
    // Hide "Your markets" view
    $("#toggle-your-markets").removeClass('active');
    $("#your-markets-header").css("display", "none");
    $("#all-markets-header").css("display", "table-row");
    $(".available-to-supply").css("display", "none");

    // collapse assets tables
    this.assets.forEach(asset => {
      asset.collapseAssetTable();
    });

    /** Asset logic */

    // Hide available assets data
    this.assets.forEach(asset => {
      asset.hideAvailableAssetData();
    });

    // Show "All market" table data
    this.assets.forEach(asset => {
      asset.showAllMarketTableData();
    });


    /** Set everything to default */

    // reset search
    this.onSearchValueChange("");

    // Remove adjust class
    this.assets.forEach(asset => {
      asset.removeAdjustClass();
    });

    // disable and reset supply and borrow sliders
    this.disableAndResetAssetsSupplyAndBorrowSliders();
  }

  onToggleYourMarketsClick(): void {
    // if all borrowed assets are 0
    this.hideRiskIfNothinBorrowed();

    /** Toggles */

    // Show "Your markets" view
    $("#toggle-your-markets").addClass('active');
    // Hide "All markets" view
    $("#toggle-all-markets").removeClass('active');
    $("#all-markets-header").css("display", "none");
    $("#your-markets-header").css("display", "table-row");

    // hide your markets header if no asset is supplied
    if (this.persistenceService.userHasNotSuppliedAnyAsset()) {
      $("#your-markets-header").css("display", "none");
    }

    // collapse assets tables
    this.assets.forEach(asset => {
      asset.collapseAssetTable();
    });


    /** Asset logic */

    // Hide "All market" table data
    this.assets.forEach(asset => {
      asset.hideAllMarketTableData();
    });

    // If asset supply or borrow does not = 0
    this.assets.forEach(asset => {
      if (this.persistenceService.userAssetSuppliedOrBorrowedNotZero(asset.asset.tag)) {
        // Hide available asset
        asset.hideAvailableAssetData();
        // Show your asset
        asset.showYourAsset();
      }
    });

    // If asset wallet, supply, and borrow = 0
    this.assets.forEach(asset => {
      if (this.persistenceService.userAssetWalletSupplyAndBorrowIsZero(asset.asset.tag)) {
        $(`.${asset.asset.tag}.asset`).css("display", "none");
      }
    });

    // If asset wallet does not = 0, and Supply = 0, and Borrow = 0
    this.assets.forEach(asset => {
      if (!this.persistenceService.userAssetWalletIsZero(asset.asset.tag)
        && this.persistenceService.userAssetWalletSupplyAndBorrowIsZero(asset.asset.tag)) {
        $(`.${asset.asset.tag}.asset`).css("display", "none");
        // Show available ICX version
        $(`.${asset.asset.tag}.asset-available`).css("display", "table-row");
        // Hide your ICX version
        $(`.${asset.asset.tag}.your`).css("display", "none");
      }
    });

    // If all assets (ICX, USDb, ..) supply = 0
    if (this.persistenceService.userHasNotSuppliedAnyAsset()) {
      $(".available-to-supply").css("display", "table-row");
    }

    /** Set everything to default */

    // reset search
    this.onSearchValueChange("");

    // Remove adjust class
    this.assets.forEach(asset => {
      asset.removeAdjustClass();
    });

    // Show default actions
    this.assets.forEach(asset => {
      asset.showDefaultActions();
    });

    // disable and reset supply and borrow sliders
    this.disableAndResetAssetsSupplyAndBorrowSliders();

    // Disable asset inputs (Your markets)
    this.disableAssetsInputs();
  }

  collapseOtherAssetsTable(assetTag: any): void {
    this.assets.forEach(assetComponent => {
      if (assetComponent.asset.tag !== assetTag) {
        assetComponent.collapseAssetTable();
      }
    });
  }

  disableAndResetAssetsSupplyAndBorrowSliders(): void {
    // disable and reset supply and borrow sliders
    this.assets.forEach(asset => {
      asset.disableAndResetSupplySlider();
      asset.disableAndResetBorrowSlider();
    });
  }

  disableAssetsInputs(): void {
    this.assets.forEach(asset => {
      asset.disableInputs();
    });
  }

  hideRiskIfNothinBorrowed(): void {
    // if all borrowed assets are 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      this.riskComponent.hideRiskData();
      this.riskComponent.showRiskMessage();
    } else {
      this.riskComponent.showRiskData();
      this.riskComponent.hideRiskMessage();
    }
  }

}


