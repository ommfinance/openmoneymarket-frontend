import {AfterViewInit, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {RiskData} from "../../models/RiskData";
import {percentageFormat} from "../../common/formats";
import {Subject} from "rxjs";
import {UserReserveData} from "../../models/UserReserveData";
import {AssetTag} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import log from "loglevel";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {BaseClass} from "../base-class";
import {UserAccountData} from "../../models/UserAccountData";
import {AssetUserComponent} from "../asset-user/asset-user.component";

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
  @Input() userAssetComponents!: QueryList<AssetUserComponent>;

  private sliderRisk?: any;
  totalRisk = 0;

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
    // log.debug("Updating total risk to: " + this.totalRisk * 100);

    // Update the risk slider
    this.sliderRisk.noUiSlider.set(this.totalRisk * 100);

    // If risk over 100
    if (this.totalRisk > 0.99) {
      // Hide supply actions
      $('.actions-2').addClass("display", "none");
      $('.value-risk-total').text("Max");
      $('.supply-risk-warning').css("display", "flex");
      $('.borrow-risk-warning').css("display", "flex");
    } else {
      $('.value-risk-total').text(percentageFormat.to(this.totalRisk * 100));
    }

    // If risk under 100
    if (this.totalRisk < 0.99) {

      $('.supply-risk-warning').css("display", "none");
      $('.borrow-risk-warning').css("display", "none");
    }

    // Change text to purple if over 50
    if (this.totalRisk > 0.50) {
      $('.value-risk-total').addClass("alert-purple");
    }

    // Remove purple if below 50
    if (this.totalRisk < 0.50) {
      $('.value-risk-total').removeClass("alert-purple");
    }

    // Change text to red if over 75
    if (this.totalRisk > 0.75) {
      $('.value-risk-total').addClass("alert");
    }

    // Change text to normal if under 75
    if (this.totalRisk < 0.75) {
      $('.value-risk-total').removeClass("alert");
    }

  }

  hideRiskData(): void {
    // show risk data
    $('.risk-container').css("display", "none");
  }

  showRiskData(): void {
    // show risk data
    $('.risk-container').css("display", "block");
  }

  showRiskMessage(): void {
    // Hide risk message
    $('.risk-message-noassets').css("display", "block");
  }

  hideRiskMessage(): void {
    // Hide risk message
    $('.risk-message-noassets').css("display", "none");
  }


}
