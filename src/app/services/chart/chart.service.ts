import { Injectable } from '@angular/core';

declare var LightweightCharts: any;

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  createSupplyChart(htmlElement: any): any {
    const chart =  LightweightCharts.createChart(htmlElement, {
      width: 392,
      height: 100,
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      handleScroll: {
        mouseWheel: false,
      },
      handleScale: {
        mouseWheel: false,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      priceScale: {
        borderVisible: false,
        autoScale: true,
        drawTicks: false,
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: '#7a8294',
        fontSize: 12,
      },
      timeScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          color: '#00b1a3',
          visible: true,
          labelVisible: true,
          width: 2,
          style: LightweightCharts.LineStyle.Solid,
          labelBackgroundColor: '#00b1a3',
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
    });

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(0,211,194,0.15)',
      bottomColor: 'rgba(63,157,213,0.15)',
      lineColor: '#00b1a3',
      lineWidth: 2,
    });

    areaSeries.setData([
      { time: '2018-05-21', value: 110.66 },
      { time: '2018-05-28', value: 108.40 },
      { time: '2018-06-04', value: 111.11 },
      { time: '2018-06-11', value: 107.90 },
      { time: '2018-06-18', value: 105.75 },
      { time: '2018-06-25', value: 104.20 },
      { time: '2018-07-02', value: 104.06 },
      { time: '2018-07-09', value: 106.36 },
      { time: '2018-07-16', value: 111.28 },
      { time: '2018-07-23', value: 116.03 },
      { time: '2018-07-30', value: 117.09 },
      { time: '2018-08-06', value: 115.73 },
      { time: '2018-08-13', value: 114.77 },
      { time: '2018-08-20', value: 114.68 },
      { time: '2018-08-27', value: 114.58 },
      { time: '2018-09-03', value: 114.32 },
      { time: '2018-09-10', value: 113.50 },
      { time: '2018-09-17', value: 117.85 },
      { time: '2018-09-24', value: 112.84 },
      { time: '2018-10-01', value: 114.62 },
      { time: '2018-10-08', value: 106.95 },
      { time: '2018-10-15', value: 107.91 },
      { time: '2018-10-22', value: 103.42 },
      { time: '2018-10-29', value: 108.38 },
      { time: '2018-11-05', value: 111.29 },
      { time: '2018-11-12', value: 109.99 },
      { time: '2018-11-19', value: 106.65 },
      { time: '2018-11-26', value: 111.19 },
      { time: '2018-12-03', value: 103.29 },
      { time: '2018-12-10', value: 100.29 },
      { time: '2018-12-17', value: 94.17 },
      { time: '2018-12-24', value: 96.83 },
      { time: '2018-12-31', value: 100.69 },
      { time: '2019-01-07', value: 99.91 },
      { time: '2019-01-14', value: 104.59 },
      { time: '2019-01-21', value: 103.39 },
      { time: '2019-01-28', value: 103.88 },
      { time: '2019-02-04', value: 101.36 },
      { time: '2019-02-11', value: 105.55 },
      { time: '2019-02-18', value: 105.00 },
      { time: '2019-02-25', value: 104.43 },
      { time: '2019-03-04', value: 103.01 },
      { time: '2019-03-11', value: 106.55 },
      { time: '2019-03-18', value: 99.76 },
      { time: '2019-03-25', value: 101.23 },
      { time: '2019-04-01', value: 105.31 },
      { time: '2019-04-08', value: 111.21 },
      { time: '2019-04-15', value: 113.46 },
      { time: '2019-04-22', value: 114.47 },
      { time: '2019-04-29', value: 116.12 },
      { time: '2019-05-06', value: 112.51 },
      { time: '2019-05-13', value: 110.77 },
      { time: '2019-05-20', value: 109.71 },
      { time: '2019-05-27', value: 109.33 },
    ]);

    return chart;
  }

  createBorrowChart(htmlElement: any): any {
    /* Borrow chart */
    const chart = LightweightCharts.createChart(htmlElement, {
      width: 392,
      height: 100,
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      handleScroll: {
        mouseWheel: false,
      },
      handleScale: {
        mouseWheel: false,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          visible: false,
        },
      },
      priceScale: {
        borderVisible: false,
        autoScale: true,
        drawTicks: false,
      },
      layout: {
        backgroundColor: 'transparent',
        textColor: '#7a8294',
        fontSize: 12,
      },
      timeScale: {
        borderVisible: false,
      },
      crosshair: {
        vertLine: {
          color: '#9d4df1',
          visible: true,
          labelVisible: true,
          width: 2,
          style: LightweightCharts.LineStyle.Solid,
          labelBackgroundColor: '#9d4df1',
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
    });

    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(96,129,223,0.15)',
      bottomColor: 'rgba(157,77,241,0.15)',
      lineColor: '#9d4df1',
      lineWidth: 2,
    });

    areaSeries.setData([
      { time: '2018-06-11', value: 107.90 },
      { time: '2018-06-18', value: 105.75 },
      { time: '2018-06-25', value: 104.20 },
      { time: '2018-07-02', value: 104.06 },
      { time: '2018-07-09', value: 106.36 },
      { time: '2018-07-16', value: 111.28 },
      { time: '2018-07-23', value: 116.03 },
      { time: '2018-07-30', value: 117.09 },
      { time: '2018-08-06', value: 115.73 },
      { time: '2018-08-13', value: 114.77 },
      { time: '2018-08-20', value: 114.68 },
      { time: '2018-08-27', value: 114.58 },
      { time: '2018-09-03', value: 114.32 },
      { time: '2018-09-10', value: 113.50 },
      { time: '2018-09-17', value: 117.85 },
      { time: '2018-09-24', value: 112.84 },
      { time: '2018-10-01', value: 114.62 },
      { time: '2018-10-08', value: 106.95 },
      { time: '2018-10-15', value: 107.91 },
      { time: '2018-10-22', value: 103.42 },
      { time: '2018-10-29', value: 108.38 },
      { time: '2018-11-05', value: 111.29 },
      { time: '2018-11-12', value: 109.99 },
      { time: '2018-11-19', value: 106.65 },
      { time: '2018-11-26', value: 111.19 },
      { time: '2018-12-03', value: 103.29 },
      { time: '2018-12-10', value: 100.29 },
      { time: '2018-12-17', value: 94.17 },
      { time: '2018-12-24', value: 96.83 },
      { time: '2018-12-31', value: 100.69 },
      { time: '2019-01-07', value: 99.91 },
      { time: '2019-01-14', value: 104.59 },
      { time: '2019-01-21', value: 103.39 },
      { time: '2019-01-28', value: 103.88 },
      { time: '2019-02-04', value: 101.36 },
      { time: '2019-02-11', value: 105.55 },
      { time: '2019-02-18', value: 105.00 },
      { time: '2019-02-25', value: 104.43 },
      { time: '2019-03-04', value: 103.01 },
      { time: '2019-03-11', value: 106.55 },
      { time: '2019-03-18', value: 99.76 },
      { time: '2019-03-25', value: 101.23 },
      { time: '2019-04-01', value: 105.31 },
      { time: '2019-04-08', value: 111.21 },
      { time: '2019-04-15', value: 113.46 },
      { time: '2019-04-22', value: 114.47 },
      { time: '2019-04-29', value: 116.12 },
      { time: '2019-05-06', value: 112.51 },
      { time: '2019-05-13', value: 110.77 },
      { time: '2019-05-20', value: 109.71 },
      { time: '2019-05-27', value: 109.33 },
    ]);

    return chart;
  }
}
