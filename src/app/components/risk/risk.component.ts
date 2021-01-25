import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {RiskData} from "../../models/RiskData";
import {percentageFormat} from "../../common/formats";
import {Subject} from "rxjs";
import {Reserve} from "../../interfaces/reserve";
import {AssetTag} from "../../models/Asset";
import {PersistenceService} from "../../services/persistence/persistence.service";
import {StateChangeService} from "../../services/state-change/state-change.service";
import log from "loglevel";
import {CalculationsService} from "../../services/calculations/calculations.service";
import {BaseClass} from "../base-class";
import {UserAccountData} from "../../models/user-account-data";

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

  @ViewChild("totalRisk")set totalRiskSetter(totalRisk: ElementRef) {this.totalRiskEl = totalRisk.nativeElement; }
  totalRiskEl!: HTMLElement;

  private sliderRisk?: any;
  // private totalRisk = 0;

  constructor(private stateChangeService: StateChangeService,
              public persistenceService: PersistenceService,
              private calculationService: CalculationsService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToLoginChange();

  }

  ngAfterViewInit(): void {
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

  initSubscribedValues(): void {
    // subscribe to total risk changes
    // this.stateChangeService.userTotalRiskChange.subscribe(totalRisk => {
    //   log.debug("Total risk change = " + totalRisk);
    //   this.totalRisk = totalRisk;
    //   this.updateRiskData(new RiskData(totalRisk));
    // });
  }

  subscribeToUserAccountDataChange(): void {
    this.stateChangeService.userAccountDataChange.subscribe((userAccountData: UserAccountData) => {
      // calculate total risk percentage
      this.updateViewRiskData(this.calculationService.calculateTotalRiskPercentage());
    });
  }

  subscribeToLoginChange(): void {
    this.stateChangeService.loginChange.subscribe(wallet => {
      log.debug(`${this.className} Login change to wallet = ${wallet}`);
      // user has logged in
      if (wallet) {
        // calculate total risk percentage
        this.updateViewRiskData(this.calculationService.calculateTotalRiskPercentage());
      } else {
        // user has logged out
        // TODO do something on logout
      }
    });
  }

  updateViewRiskData(riskTotal: number): void {
    // Update the risk percentage
    $(this.totalRiskEl).text(percentageFormat.to(riskTotal));

    // Update the risk slider
    this.sliderRisk.noUiSlider.set(riskTotal);

    // Change text to red if over 100
    if (riskTotal > 100) {
      $(this.totalRiskEl).addClass("alert");
    }

    // Change text to red if over 75
    if (riskTotal > 75) {
      $(this.totalRiskEl).addClass("alert");
    }

    // Change text to normal if under 75
    if (riskTotal < 75) {
      $(this.totalRiskEl).removeClass("alert");
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
