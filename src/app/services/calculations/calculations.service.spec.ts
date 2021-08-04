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
    const ommPriceUSD = 6.89;
    const dailyBorrowRewards = 8000;

    const reserveData = {
      exchangePrice: 1,
      totalBorrows: 1032.858237900987
    };

    expect(service.borrowOmmApyFormula(dailyBorrowRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.USDS))
      .toBeCloseTo(19478.7621976915, 2);
  });

  it('Test supplyOmmApyFormula USDS', () => {
    const ommPriceUSD = 6.89;
    const dailySupplyRewards = 8000;

    const reserveData = {
      exchangePrice: 1,
      totalLiquidity: 2159.455452592119
    };

    expect(service.supplyOmmApyFormula(dailySupplyRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.USDS))
      .toBeCloseTo(9316.608025347428, 2);
  });
});
