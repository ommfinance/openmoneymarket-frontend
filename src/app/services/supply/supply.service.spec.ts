import { TestBed } from '@angular/core/testing';

import { SupplyService } from './supply.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DepositService', () => {
  let service: SupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(SupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
