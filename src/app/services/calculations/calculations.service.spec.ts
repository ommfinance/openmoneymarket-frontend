import { TestBed } from '@angular/core/testing';

import { CalculationsService } from './calculations.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ReserveData} from "../../models/AllReservesData";
import {AssetTag} from "../../models/Asset";
import {UserReserveData} from "../../models/UserReserveData";

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
    const ommPriceUSD = 7.34;
    const dailyBorrowRewards = 8000;
    const usdsPrice = 1;

    const reserveData = {
      exchangePrice: usdsPrice,
      totalBorrows: 1032.86
    };

    expect(service.borrowOmmApyFormula(dailyBorrowRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.USDS))
      .toBeCloseTo(20750.92, 2);
  });

  it('Test borrowOmmApyFormula ICX', () => {
    const ommPriceUSD = 7.34;
    const dailyBorrowRewards = 800;
    const icxPrice = 1.06;
    const borrowAmount = 979.39;
    const sICXRate = 1.0377358491;

    const reserveData = {
      exchangePrice: icxPrice,
      totalBorrows: borrowAmount,
      sICXRate
    };

    expect(service.borrowOmmApyFormula(dailyBorrowRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.ICX))
      .toBeCloseTo(1989.438695, 2);
  });

  it('Test supplyOmmApyFormula USDS', () => {
    const ommPriceUSD = 7.34;
    const dailySupplyRewards = 8000;
    const usdsPrice = 1;
    const supplyAmount = 2159.46;

    const reserveData = {
      exchangePrice: usdsPrice,
      totalLiquidity: supplyAmount
    };

    expect(service.supplyOmmApyFormula(dailySupplyRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.USDS))
      .toBeCloseTo(9925.073861057857, 2);
  });

  it('Test supplyOmmApyFormula ICX', () => {
    const ommPriceUSD = 7.34;
    const dailySupplyRewards = 7200;
    const icxPrice = 1.06;
    const supplyAmount = 16037.36;
    const sICXRate = 1.0377358491;

    const reserveData = {
      exchangePrice: icxPrice,
      totalLiquidity: supplyAmount,
      sICXRate
    };

    expect(service.supplyOmmApyFormula(dailySupplyRewards, ommPriceUSD, reserveData as ReserveData, AssetTag.USDS))
      .toBeCloseTo(1134.7042391864052, 2);
  });

  it('Test userBorrowOmmRewardsFormula USDS', () => {
    const dailyBorrowRewards = 8000;
    const borrowAmount = 1032.86;
    const userBorrowAmount = 50.02;

    const reserveData = {
      totalBorrows: borrowAmount,
    } as ReserveData;

    const userReserveData = {
      currentBorrowBalance: userBorrowAmount,
    } as UserReserveData;

    expect(service.userBorrowOmmRewardsFormula(dailyBorrowRewards, reserveData, userReserveData))
      .toBeCloseTo(387.4290804174816, 2);
  });

  it('Test userBorrowOmmRewardsFormula iUSDC', () => {
    const dailyBorrowRewards = 8000;
    const borrowAmount = 935.01;
    const userBorrowAmount = 50.01;

    const reserveData = {
      totalBorrows: borrowAmount,
    } as ReserveData;

    const userReserveData = {
      currentBorrowBalance: userBorrowAmount,
    } as UserReserveData;

    expect(service.userBorrowOmmRewardsFormula(dailyBorrowRewards, reserveData, userReserveData))
      .toBeCloseTo(427.8884718, 2);
  });

  it('Test userSupplyOmmRewardsFormula sICX', () => {
    const dailySupplyRewards = 7200;
    const supplyAmount = 16037.36;
    const userSupplyAmount = 901.74;

    const reserveData = {
      totalLiquidity: supplyAmount,
    } as ReserveData;

    const userReserveData = {
      currentOTokenBalance: userSupplyAmount,
    } as UserReserveData;

    expect(service.userSupplyOmmRewardsFormula(dailySupplyRewards, reserveData, userReserveData))
      .toBeCloseTo(404.837704, 2);
  });

});
