import { TestBed } from '@angular/core/testing';

import { RepayService } from './repay.service';

describe('RepayService', () => {
  let service: RepayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RepayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
