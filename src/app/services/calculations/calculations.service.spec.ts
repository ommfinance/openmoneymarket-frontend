import { TestBed } from '@angular/core/testing';

import { CalculationsService } from './calculations.service';

describe('CalculationsService', () => {
  let service: CalculationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('Test borrowOmmApyFormula USDS', () => {
    const borrowRate = 5;
    const ommPriceUSD = 2;
    const ommTokenDistribution = 1000000;
    const totalInterestOverAYear = 525000;

    expect(service.borrowOmmApyFormula(borrowRate, totalInterestOverAYear, ommTokenDistribution, ommPriceUSD)).toBeCloseTo(1390.48, 2);
  });

  it('Test borrowOmmApyFormula USDS testnet values', () => {
    const borrowRate = 3.617802522022774;
    const ommPriceUSD = 2;
    const ommTokenDistribution = 1000000;
    const totalInterestOverAYear = 406.97350242030865;
    const expectedResult = 1297871.15;
    expect(service.borrowOmmApyFormula(borrowRate, totalInterestOverAYear, ommTokenDistribution, ommPriceUSD)).toBeCloseTo(expectedResult, 2);
  });

  it('Test calculateSupplyApyWithOmmRewards USDS', () => {
    const supplyRate = 1.8; // a.k.a liquidity rate
    const ommPriceUSD = 2;
    const ommTokenDistribution = 1000000;
    const totalInterestOverAYear = 472500;

    expect(service.supplyOmmApyFormula(supplyRate, totalInterestOverAYear, ommTokenDistribution, ommPriceUSD)).toBeCloseTo(556.19, 2);
  });
});
