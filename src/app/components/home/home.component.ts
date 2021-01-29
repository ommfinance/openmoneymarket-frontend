import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
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
import {RiskData} from "../../models/RiskData";
import {AssetUserAvailableComponent} from "../asset-user-available/asset-user-available.component";
import {AssetMarketComponent} from "../asset-market/asset-market.component";
import {ActiveMarketView} from "../../models/ActiveMarketView";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalAction} from "../../models/ModalAction";
import {ReloaderService} from "../../services/reloader/reloader.service";

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
  @ViewChildren('userAssetAsset') userAssetComponents!: QueryList<AssetUserComponent>;
  // Asset children components
  @ViewChildren('availAsset') userAvailableAssetComponents!: QueryList<AssetUserAvailableComponent>;
  // Asset children components
  @ViewChildren('marketAsset') marketAssetComponents!: QueryList<AssetMarketComponent>;

  // array of the user's assets (user's balance of asset > 0)
  public userAssets: Asset[] = [];
  // array of the user's available (user's balance of asset > 0 and supplied = 0)
  public availableAssets: Asset[] = [];
  // array of the market assets
  public marketAssets: Asset[] = [];

  // keep track of current active market view in this variable
  public activeMarketView: ActiveMarketView = ActiveMarketView.ALL_MARKET;


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

  // load the asset lists
  loadAssetLists(): void {
    this.userAssets = [];
    this.availableAssets = [];
    this.marketAssets = [];

    Array.from(this.supportedAssetsMap.values()).forEach(asset => {
      // always push to market asset array
      this.marketAssets.push(asset);

      // if user is logged in, load his available and current assets
      if (this.persistenceService.userLoggedIn()) {
        if (this.persistenceService.isAssetAvailableToSupply(asset.tag)) {
          this.availableAssets.push(asset);
        }
        // make sure that asset is either supplied, borrowed or its balance > 0
        else if (!this.persistenceService.isAssetSuppliedBorrowedBalanceZero(asset.tag)) {
          this.userAssets.push(asset);
        }
      }
    });

    log.debug("this.userAssets=", this.userAssets);
    log.debug("this.availableAssets=", this.availableAssets);
    log.debug("this.marketAssets=", this.marketAssets);
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
    this.loadAssetLists();
    this.cd.detectChanges();

    this.registerSubscriptions();
  }

  private registerSubscriptions(): void {
    this.subscribeToUserModalActionChange();
    this.subscribeToUserAssetReserveChange();
    this.subscribeToUserAssetBalanceChange();
  }

  private subscribeToUserAssetReserveChange(): void {
    // for each user asset subscribe to its reserve data change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userReserveChangeMap.get(assetTag)!.subscribe((reserve: UserReserveData) => {
        // when ever there is a change in user reserve data

        // reload the asset lists
        this.loadAssetLists();
      });
    });
  }

  private subscribeToUserAssetBalanceChange(): void {
    // for each user asset subscribe to its balance change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userBalanceChangeMap.get(assetTag)!.subscribe((newBalance: number) => {
        // when ever there is a change in user asset balance

        // reload the asset lists
        this.loadAssetLists();
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
    $(".available-to-supply").css("display", "none");

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

    // re-load the asset lists
    this.loadAssetLists();

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

  updateRiskData(riskData?: RiskData): void {
    const riskTotal = riskData ? riskData.riskTotal : this.calculationService.calculateTotalRiskPercentage();
    this.riskComponent?.updateViewRiskData(riskTotal);
  }

  userMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.USER_MARKET;
  }

  allMarketViewActive(): boolean {
    return this.activeMarketView === ActiveMarketView.ALL_MARKET;
  }

  shouldShowAssetAvailable(): boolean {
    return this.userMarketViewActive()
      && this.availableAssets.length > 0
      && this.persistenceService.userLoggedIn();
  }

}


