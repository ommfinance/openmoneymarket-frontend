import {AfterViewInit, Component, OnInit} from '@angular/core';

declare var noUiSlider: any;
declare var wNumb: any;

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

}
