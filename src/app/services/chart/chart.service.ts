import { Injectable } from '@angular/core';
import {PersistenceService} from "../persistence/persistence.service";
import {Utils} from "../../common/utils";
import {AssetTag} from "../../models/Asset";
import {InterestHistoryData} from "../../models/InterestHistoryData";
import {InterestHistoryRecord} from "../../models/InterestHistoryRecord";
import {InterestHistoryService} from "../interest-history/interest-history.service";

declare var LightweightCharts: any;

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(private persistenceService: PersistenceService,
              private interestHistoryService: InterestHistoryService) { }

  createBorrowAndSupplyInterestHistoryChart(supplyChartHtmlElement: any, borrowChartHtmlElement: any, assetTag: AssetTag, supplyChart: any,
                                            borrowChart: any)
    : { borrowChart: any, supplyChart: any } {

    // clear charts if they are already established
    borrowChart?.remove();
    supplyChart?.remove();


    const supplyData: {time: string, value: number}[] = [];
    const borrowData: {time: string, value: number}[] = [];

    this.persistenceService.interestHistory.forEach(historyData => {
      const assetData: InterestHistoryRecord[] | undefined = historyData.data[
        AssetTag.toAdjustedString(assetTag) as keyof InterestHistoryData
        ];

      if (assetData) {
        const borrowAndSupplyInterests = this.interestHistoryService.getAverageInterests(assetData);
        supplyData.push({ time: Utils.dateToDateOnlyIsoString(historyData.date), value: borrowAndSupplyInterests.supplyApy});
        borrowData.push({ time: Utils.dateToDateOnlyIsoString(historyData.date), value: borrowAndSupplyInterests.borrowApr});
      }
    });

    if (supplyData.length > 0) {
      supplyChart =  LightweightCharts.createChart(supplyChartHtmlElement, this.constructChartOptions('#00b1a3'));

      const supplyChartAreaSeries = supplyChart.addAreaSeries({
        topColor: 'rgba(0,211,194,0.15)',
        bottomColor: 'rgba(63,157,213,0.15)',
        lineColor: '#00b1a3',
        lineWidth: 2,
      });

      supplyChartAreaSeries.setData(supplyData);
    }
    if (borrowData.length > 0) {
      borrowChart = LightweightCharts.createChart(borrowChartHtmlElement, this.constructChartOptions('#9d4df1'));

      const borrowChartAreaSeries = borrowChart.addAreaSeries({
        topColor: 'rgba(96,129,223,0.15)',
        bottomColor: 'rgba(157,77,241,0.15)',
        lineColor: '#9d4df1',
        lineWidth: 2,
      });

      borrowChartAreaSeries.setData(borrowData);
    }


    return {
      supplyChart: supplyData.length > 0 ? supplyChart : undefined,
      borrowChart: borrowData.length > 0 ? borrowChart : undefined,
    };
  }

  private constructChartOptions(crossHairColor: string): any {
    return {
      width: 392,
      height: 100,
      leftPriceScale: {
        visible: false,
      },
      rightPriceScale: {
        visible: false,
      },
      handleScroll: {
        mouseWheel: true,
      },
      handleScale: {
        mouseWheel: true,
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
          color: crossHairColor,
          visible: true,
          labelVisible: true,
          width: 2,
          style: LightweightCharts.LineStyle.Solid,
          labelBackgroundColor: crossHairColor,
        },
        horzLine: {
          visible: false,
          labelVisible: false,
        },
      },
    };
  }
}


