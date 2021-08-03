import { TestBed } from '@angular/core/testing';

import { CalculationsService } from './calculations.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ReserveData} from "../../models/AllReservesData";
import {AssetTag} from "../../models/Asset";

describe('CalculationsService', () => {
  let service: CalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(CalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Test borrowOmmApyFormula USDS', () => {
    const ommPriceUSD = 2;
    const ommTokenDistribution = 1000000;
    const lendingBorrowingPortion = 0.1;

    const reserveData = {
      rewardPercentage: 0.4,
      borrowingPercentage: 0.5,
      exchangePrice: 1,
      totalBorrows: 5000000
    };

    expect(service.borrowOmmApyFormula(lendingBorrowingPortion, ommTokenDistribution, ommPriceUSD,
      reserveData as ReserveData, AssetTag.USDS)).toBeCloseTo(2.920, 2);
  });

  it('Test supplyOmmApyFormula USDS', () => {
    const ommPriceUSD = 2;
    const ommTokenDistribution = 1000000;
    const totalInterestOverAYear = 825000;
    const lendingBorrowingPortion = 0.1;

    const reserveData = {
      rewardPercentage: 0.4,
      lendingPercentage: 0.5,
      exchangePrice: 1,
      totalLiquidity: 10000000
    };

    expect(service.supplyOmmApyFormula(lendingBorrowingPortion, totalInterestOverAYear, ommTokenDistribution, ommPriceUSD,
      reserveData as ReserveData, AssetTag.USDS)).toBeCloseTo(1.46, 2);
  });
});
