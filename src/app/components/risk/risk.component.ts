import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild} from '@angular/core';
import {PersistenceService} from "../../services/persistence/persistence.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {BaseClass} from "../base-class";
import {UserAccountData} from "../../models/UserAccountData";
import {AssetComponent} from "../asset/asset.component";
import BigNumber from "bignumber.js";

declare var noUiSlider: any;
declare var wNumb: any;
declare var $: any;

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.css']
})
export class RiskComponent extends BaseClass implements OnInit, AfterViewInit {

  className = "[RiskComponent]";

  @ViewChild("risk")set totalRiskSetter(totalRisk: ElementRef) {this.totalRiskEl = totalRisk.nativeElement; }
  totalRiskEl!: HTMLElement;


  // users asset components
  @Input() userAssetComponents!: QueryList<AssetComponent>;

  sliderRisk?: any;
  totalRisk = new BigNumber("0");

  constructor(private stateChangeService: StateChangeService,
              public persistenceService: PersistenceService,
              private calculationService: CalculationsService) {
    super(persistenceService);
  }

  ngOnInit(): void {
    this.initSubscribedValues();
  }

  ngAfterViewInit(): void {
    this.initRiskSlider();

    if (this.persistenceService.userLoggedIn()) {
      // re-calculate total risk percentage
      this.calculationService.calculateTotalRisk();
    }
  }

  initSubscribedValues(): void {
    this.subscribeToTotalRiskChange();
    this.subscribeToUserAccountDataChange();
  }

  private subscribeToTotalRiskChange(): void {
    // subscribe to total risk changes
    this.stateChangeService.userTotalRiskChange.subscribe(totalRisk => {
      // log.debug("Total risk change = " + totalRisk);
      this.totalRisk = totalRisk;
      this.updateViewRiskData();
    });
  }

  subscribeToUserAccountDataChange(): void {
    this.stateChangeService.userAccountDataChange.subscribe((userAccountData: UserAccountData) => {
      // re-calculate total risk percentage
      this.calculationService.calculateTotalRisk();
    });
  }

  initRiskSlider(): void {
    // Risk slider
    this.sliderRisk = document.getElementById('slider-risk');
    noUiSlider.create(this.sliderRisk, {
      start: [0],
      connect: 'lower',
      tooltips: [wNumb({decimals: 0, thousand: ',', suffix: '%'})],
      range: {
        min: [0],
        max: [100]
      },
    });
  }

  updateViewRiskData(): void {
    // Update the risk slider
    this.sliderRisk.noUiSlider.set(this.totalRisk.multipliedBy(new BigNumber("100")).dp(2).toNumber());
  }
}
