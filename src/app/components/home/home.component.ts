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
import {SupplyService} from "../../services/supply/supply.service";

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
import {StateChangeService} from "../../services/state-change/state-change.service";
import {RiskData} from "../../models/RiskData";

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  className = "HomeComponent";

  // Child components
  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  @ViewChild(RiskComponent) private riskComponent!: RiskComponent;
  // Asset children components
  @ViewChildren('asset') assets!: QueryList<AssetComponent>;

  searchValue = "";

  public toggleLogic = toggleLogic;

  public supportedAssets: Asset[] = Array.from(this.supportedAssetsMap.values());

  constructor(public persistenceService: PersistenceService,
              public depositService: SupplyService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService,
              private cd: ChangeDetectorRef,
              private stateChangeService: StateChangeService) {
    super();
  }

  ngOnInit(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) { // TODO improve
        log.debug(`${this.className} Login with wallet = ${wallet}`);
        this.onToggleYourMarketsClick();
      } else {
        this.onToggleAllMarketsClick();
      }
    });
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.supportedAssets = Array.from(this.supportedAssetsMap.values());
    this.cd.detectChanges();
  }



  onSearchValueChange(newValue: any): void {
    this.searchValue = newValue;
    this.hideNonSearchedAssets();
  }

  hideNonSearchedAssets(): void {
    log.debug(`${this.className} hideNonSearchedAssets called`);
    this.assets.forEach(assetComponent => {
      const yourMarketsShown = $("#toggle-your-markets").hasClass("active");
      const allMarketsShown = $("#toggle-all-markets").hasClass("active");
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
    this.hideRiskIfNothingBorrowed();

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
    this.hideRiskIfNothingBorrowed();

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
        asset.hideYourAndAvailableAsset();
      }
    });

    // If asset wallet does not = 0, and Supply = 0, and Borrow = 0
    log.debug(`If asset wallet does not = 0, and Supply = 0, and Borrow = 0`);
    this.assets.forEach(asset => {
      log.debug(`${asset.asset.tag} wallet does not = 0 -> boolean = ${!this.persistenceService.userAssetWalletIsZero(asset.asset.tag)}`);
      log.debug(`${asset.asset.tag} Supply = 0, and Borrow = 0 -> boolean = ${this.persistenceService.userAssetSuppliedAndBorrowedIsZero(asset.asset.tag)}`);
      log.debug(`${asset.asset.tag} Supplied = ${this.persistenceService.getUserSuppliedAssetBalance(asset.asset.tag)}`);
      log.debug(`${asset.asset.tag} Borrowed = ${this.persistenceService.getUserBorrowedAssetBalance(asset.asset.tag)}`);


      if (!this.persistenceService.userAssetWalletIsZero(asset.asset.tag)
        && this.persistenceService.userAssetSuppliedAndBorrowedIsZero(asset.asset.tag)) {
        asset.showAssetAvailableAndHideAssetYour();
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
    this.assets.forEach((assetComponent, index) => {
      if (assetComponent.asset.tag !== assetTag) {
        assetComponent.collapseAssetTableSlideUp();
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

  hideRiskIfNothingBorrowed(): void {
    // if all borrowed assets are 0
    if (this.persistenceService.userHasNotBorrowedAnyAsset()) {
      this.riskComponent.hideRiskData();
      this.riskComponent.showRiskMessage();
    } else {
      this.riskComponent.showRiskData();
      this.riskComponent.hideRiskMessage();
    }
  }

  updateRiskData(riskData?: RiskData): void {
    this.riskComponent?.updateRiskData(riskData);
  }

}


