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
import {AssetComponent} from "../asset/asset.component";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {ActiveMarketOverview, ActiveViews} from "../../models/ActiveViews";
import {UserReserveData} from "../../models/UserReserveData";
import {ModalAction} from "../../models/ModalAction";
import {BridgeWidgetService} from "../../services/bridge-widget/bridge-widget.service";
import {Utils} from "../../common/utils";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  className = "[HomeComponent]";

  // Child components
  @ViewChild(HeaderComponent) private headerComponent!: HeaderComponent;
  @ViewChild(RiskComponent) riskComponent!: RiskComponent;

  // Asset children components
  @ViewChildren('assetEl') assetComponents!: QueryList<AssetComponent>;
  // Asset children components
  @ViewChildren('availAsset') userAvailableAssetComponents!: QueryList<AssetComponent>;

  // array of the user's assets (user's balance of asset, supplied > 0)
  public userAssets: Asset[] = [];
  // array of the user's available (user's balance of asset > 0 and supplied = 0)
  public availableAssets: Asset[] = [];

  // keep track of current active market view in this variable
  public activeMarketView: ActiveViews = ActiveViews.ALL_MARKET;
  public activeMarketOverview: ActiveMarketOverview = this.userLoggedIn() ? ActiveMarketOverview.YOUR_OVERVIEW :
    ActiveMarketOverview.MARKET_OVERVIEW;

  public hideMarketHeader = false;

  // OMM toggle checkbox
  public ommApyChecked = false;


  constructor(public persistenceService: PersistenceService,
              public depositService: SupplyService,
              public withdrawService: WithdrawService,
              public borrowService: BorrowService,
              public repayService: RepayService,
              public slidersService: SlidersService,
              public calculationService: CalculationsService,
              private cd: ChangeDetectorRef,
              private stateChangeService: StateChangeService,
              private bridgeWidgetService: BridgeWidgetService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
  }

  ngAfterViewInit(): void {
    this.loadAssetLists();

    if (this.userLoggedIn()) {
      this.onYourMarketsClick();
    }

    // call cd after to avoid ExpressionChangedAfterItHasBeenCheckedError
    this.cd.detectChanges();
  }


  ommApyToggleChanged(): void {
    // TODO overview total / your APY logic
  }

  // load the asset lists
  loadAssetLists(): void {
    if (this.activeMarketView === ActiveViews.ALL_MARKET) {
      this.userAssets = [...this.supportedAssets];
    } else {
      this.userAssets = [];
      this.availableAssets = [];

      Array.from(this.supportedAssetsMap.values()).forEach(asset => {
        // if user is logged in, load his available and current assets
        if (this.userLoggedIn()) {
          // Asset that is supplied or borrowed should be in userAssets
          if (this.persistenceService.assetSuppliedOrBorrowed(asset.tag)) {
            this.userAssets.push(asset);
          }
          // check if asset is available to supply
          else if (this.persistenceService.isAssetAvailableToSupply(asset.tag)) {
            this.availableAssets.push(asset);
          }
        }
      });
    }
  }

  private registerSubscriptions(): void {
    this.subscribeToLoginChange();
    this.subscribeToUserModalActionChange();
    this.subscribeToUserAssetReserveChange();
    this.subscribeToUserAssetBalanceChange();
  }

  private subscribeToLoginChange(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      if (wallet) {
        // user login
        this.onYourMarketsClick();
        this.onToggleYourOverviewClick();
      } else {
        // user logout
        this.onToggleMarketOverviewClick();
        this.onAllMarketsClick();
      }
    });
  }

  private subscribeToUserAssetReserveChange(): void {
    // for each user asset subscribe to its reserve data change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userReserveChangeMap.get(assetTag)!.subscribe((reserve: UserReserveData) => {
        // reload the asset lists
        this.loadAssetLists();
      });
    });
  }

  private subscribeToUserAssetBalanceChange(): void {
    // for each user asset subscribe to its balance change
    Object.values(AssetTag).forEach(assetTag => {
      this.stateChangeService.userBalanceChangeMap.get(assetTag)!.subscribe((newBalance: number) => {
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

  onDepositUSDClick(): void {
    this.bridgeWidgetService.openBridgeWidget();
  }

  // On "Market overview" click
  onToggleMarketOverviewClick(): void {
    this.activeMarketOverview = ActiveMarketOverview.MARKET_OVERVIEW;
  }

  // On "Your overview" click
  onToggleYourOverviewClick(): void {
    this.activeMarketOverview = ActiveMarketOverview.YOUR_OVERVIEW;
  }

  // On "All markets tab" click
  onAllMarketsClick(): void {
    // set active market view
    this.activeMarketView = ActiveViews.ALL_MARKET;

    // re-load the asset lists
    this.loadAssetLists();

    // collapse assets tables
    this.collapseTableUserAssets();

    /** Set everything to default */

    // Remove adjust class in user assets
    this.removeAdjustClass();

    // disable and reset supply and borrow sliders
    this.disableAndResetAssetsSupplyAndBorrowSliders();
  }

  onYourMarketsClick(): void {
    // set active market view
    this.activeMarketView = ActiveViews.USER_MARKET;

    // re-load the asset lists
    this.loadAssetLists();

    // collapse assets tables
    this.collapseTableUserAssets();

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
    this.assetComponents.forEach(userAssetComponent => {
      userAssetComponent.showDefaultActions();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.showDefaultActions();
    });
  }

  removeAdjustClass(): void {
    this.assetComponents.forEach(userAssetComponent => {
      userAssetComponent.removeAdjustClass();
    });
    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.removeAdjustClass();
    });
  }

  collapseOtherAssetsTable(assetTag: any): void {
    this.assetComponents.forEach((userAssetComponent, index) => {
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
    this.assetComponents.forEach(userAssetComponent => {
      userAssetComponent.collapseAssetTable();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.collapseAssetTable();
    });
  }

  disableAndResetAssetsSupplyAndBorrowSliders(): void {
    // disable and reset supply and borrow sliders
    this.assetComponents.forEach(userAssetComponent => {
      userAssetComponent.disableAndResetSupplySlider();
      userAssetComponent.disableAndResetBorrowSlider();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.disableAndResetSupplySlider();
    });
  }

  disableAssetsInputs(): void {
    this.assetComponents.forEach(userAssetComponent => {
      userAssetComponent.disableInputs();
    });

    this.userAvailableAssetComponents.forEach(userAvailableAssetComponent => {
      userAvailableAssetComponent.disableInputs();
    });
  }

  // hide your market header if view is not active or active assets length == 0 and available is not
  shouldHideYourMarketHeader(): boolean {
    return !this.userMarketViewActive() || this.userAssets.length === 0;
  }

  noActiveOrAvailableAsset(): boolean {
    return this.userAssets.length === 0 && this.availableAssets.length === 0;
  }

  userMarketViewActive(): boolean {
    return this.activeMarketView === ActiveViews.USER_MARKET;
  }

  allMarketViewActive(): boolean {
    return this.activeMarketView === ActiveViews.ALL_MARKET;
  }

  isMarketOverviewActive(): boolean {
    return this.activeMarketOverview === ActiveMarketOverview.MARKET_OVERVIEW;
  }

  getOmmPriceUSD(): string {
    return `($${this.formatNumberToUSLocaleString(Utils.roundOffTo2Decimals(this.persistenceService.ommPriceUSD))})`;
  }
}
