import {AfterViewInit, Component, OnInit} from '@angular/core';

declare var noUiSlider: any;
declare var wNumb: any;
declare var $: any;

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html',
  styleUrls: ['./risk.component.css']
})
export class RiskComponent implements OnInit, AfterViewInit {

  private sliderRisk?: HTMLElement | null;

  constructor() { }

  ngOnInit(): void {
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
