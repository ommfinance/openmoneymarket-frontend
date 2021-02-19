import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
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
import {RiskComponent} from "../risk/risk.component";
import {Asset, AssetTag} from "../../models/Asset";
import log from "loglevel";
import {AssetUserComponent} from "../asset-user/asset-user.component";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {AssetMarketComponent} from "../asset-market/asset-market.component";
import {ActiveMarketView} from "../../models/ActiveMarketView";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalAction} from "../../models/ModalAction";

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  className = "[HomeComponent]";

  // Child components
  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  @ViewChild(RiskComponent) private riskComponent!: RiskComponent;

  // Asset children components
  @ViewChildren('userAsset') userAssetComponents!: QueryList<AssetUserComponent>;
  // Asset children components
  @ViewChildren('availAsset') userAvailableAssetComponents!: QueryList<AssetUserComponent>;
  // Asset children components
  @ViewChildren('marketAsset') marketAssetComponents!: QueryList<AssetMarketComponent>;

  @ViewChildren('availSplitter') availableAssetSplitterEl!: ElementRef;

  // keep track of current active market view in this variable
  public activeMarketView: ActiveMarketView = ActiveMarketView.ALL_MARKET;

  public hideMarketHeader = false;


  constructor(public persistenceService: PersistenceService,
              public depositService: SupplyService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService,
              private cd: ChangeDetectorRef,
              private stateChangeService: StateChangeService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }

  private registerSubscriptions(): void {
    this.subscribeToLoginChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToUserAssetReserveChange();
    this.subscribeToUserAssetBalanceChange();
  }

  private subscribeToLoginChange(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) { // TODO improve
        log.debug(`${this.className} Login with wallet = ${wallet}`);
        this.onToggleYourMarketsClick();
      } else {
        this.onToggleAllMarketsClick();
      }
    });
  }

  reloadAssets(): void {
    this.supportedAssets = [...this.supportedAssets];
  }

  private subscribeToUserAssetReserveChange(): void {
    // for each user asset subscribe to its reserve data change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userReserveChangeMap.get(assetTag)!.subscribe((reserve: UserReserveData) => {
        // when ever there is a change in user reserve data
        this.reloadAssets();
        this.shouldHideYourMarketHeader();
      });
    });
  }

  private subscribeToUserAssetBalanceChange(): void {
    // for each user asset subscribe to its balance change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userBalanceChangeMap.get(assetTag)!.subscribe((newBalance: number) => {
        // when ever there is a change in user asset balance
        this.reloadAssets();
        this.shouldHideYourMarketHeader();
      });
    });
  }

  private subscribeToUserModalActionChange(): void {
    // User confirmed the modal action
    this.stateChangeService.userModalActionChange.subscribe((modalAction?: ModalAction) => {
      log.debug(`userModalActionChange -> modalAction: ${modalAction}`);
      // collapse the opened tables of the user assets
      this.collapseTableUserAssets();
    });
  }


  // On "Market overview" click
  onToggleMarketOverviewClick(): void {
    $("#toggle-your-overview").removeClass('active');
    $("#toggle-market-overview").addClass('active');
    $("#your-overview-content").hide();
    $("#market-overview-content").show();
  }

  // On "Your overview" click
  onToggleYourOverviewClick(): void {
    $("#toggle-your-overview").addClass('active');
    $("#toggle-market-overview").removeClass('active');
    $("#your-overview-content").show();
    $("#market-overview-content").hide();
  }

  // On "All markets tab" click
  onToggleAllMarketsClick(): void {
    // set active market view
    this.activeMarketView = ActiveMarketView.ALL_MARKET;

    // if all borrowed assets are 0
    this.hideRiskIfNothingBorrowed();

    /** Toggles */

    // Show "All markets" view
    $("#toggle-all-markets").addClass('active');
    // Hide "Your markets" view
    $("#toggle-your-markets").removeClass('active');
    $("#your-markets-header").css("display", "none");
    $("#all-markets-header").css("display", "table-row");

    // collapse assets tables
    this.collapseTableUserAssets();

    /** Asset logic */

    // Hide user current and available assets data
    this.hideUserAssets();

    // Show "All market" table data (assets)
    this.showMarketAssets();

    /** Set everything to default */

    // Remove adjust class in user assets
    this.removeAdjustClass();

    // disable and reset supply and borrow sliders
    this.disableAndResetAssetsSupplyAndBorrowSliders();
  }

  onToggleYourMarketsClick(): void {
    // set active market view
    this.activeMarketView = ActiveMarketView.USER_MARKET;

    // if all borrowed assets are 0
    this.hideRiskIfNothingBorrowed();

    /** Toggles */

    // Show "Your markets" view
    $("#toggle-your-markets").addClass('active');
    // Hide "All markets" view
    $("#toggle-all-markets").removeClass('active');
    $("#all-markets-header").css("display", "none");
    $("#your-markets-header").css("display", "table-row");

    // hide your markets header if no asset-user is supplied
    if (this.persistenceService.userHasNotSuppliedAnyAsset()) {
      $("#your-markets-header").css("display", "none");
    }

    // collapse assets tables
    this.collapseTableUserAssets();

    /** Asset logic */

    // Hide "All market" table data
    this.hideMarketAssets();

    // Show user current and available assets
    this.showUserAssets();

    /** Set everything to default */

    // Remove adjust class
    this.removeAdjustClass();

    // Show default actions
    this.showDefaultActions();

    // disable and reset supply and borrow sliders
    this.disableAndResetAssetsSupplyAndBorrowSliders();

    // Disable asset-user inputs (Your markets)
    this.disableAssetsInputs();
  }

  isAvailableSplitterShown(): boolean {
    return this.availableAssetSplitterEl.nativeElement != null;
  }

  shouldHideYourMarketHeader(): void {
    for (const asset of this.supportedAssets) {
      // if asset is not of type available to supply return false
      if (!this.persistenceService.isAssetAvailableToSupply(asset.tag)) {
        this.hideMarketHeader = !this.userMarketViewActive();
      }
    }

    this.hideMarketHeader = true;
  }

  showDefaultActions(): void {
    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.showDefaultActions();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.showDefaultActions();
    });
  }

  // hides market assets
  hideMarketAssets(): void {
    this.marketAssetComponents.forEach(marketAssetComponent => {
      marketAssetComponent.hideAsset();
    });

  }

  // show user current and available assets
  showUserAssets(): void {
    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.showAsset();
    });

    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.showAsset();
    });
  }

  // hides user current and available assets
  hideUserAssets(): void {
    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.hideAsset();
    });

    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.hideAsset();
    });
  }

  showMarketAssets(): void {
    this.marketAssetComponents.forEach(marketAssetComponent => {
      marketAssetComponent.showAsset();
    });
  }

  removeAdjustClass(): void {
    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.removeAdjustClass();
    });
    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.removeAdjustClass();
    });
  }

  collapseOtherAssetsTable(assetTag: any): void {
    log.debug(`collapseOtherAssetsTable called from asset ${assetTag}`);
    log.debug(this.userAssetComponents);
    log.debug(this.userAvailableAssetComponents);

    this.userAssetComponents.forEach((userAssetComponent, index) => {
      if (userAssetComponent.asset.tag !== assetTag) {
        userAssetComponent.collapseAssetTableSlideUp();
      }
    });

    this.userAvailableAssetComponents.forEach((userAvailableAssetComponent, index) => {
      if (userAvailableAssetComponent.asset.tag !== assetTag) {
        userAvailableAssetComponent.collapseAssetTableSlideUp();
      }
    });
  }

  collapseTableUserAssets(): void {
    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.collapseAssetTable();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.collapseAssetTable();
    });
  }

  disableAndResetAssetsSupplyAndBorrowSliders(): void {
    // disable and reset supply and borrow sliders
    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.disableAndResetSupplySlider();
      userAssetComponent.disableAndResetBorrowSlider();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.disableAndResetSupplySlider();
    });
  }

  disableAssetsInputs(): void {
    this.userAssetComponents.forEach(userAssetComponent => {
      userAssetComponent.disableInputs();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.disableInputs();
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

  userMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.USER_MARKET;
  }

  allMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.ALL_MARKET;
  }

}


