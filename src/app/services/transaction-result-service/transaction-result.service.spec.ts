import { TestBed } from '@angular/core/testing';

import { TransactionResultService } from './transaction-result.service';

describe('TransactionResultService', () => {
  let service: TransactionResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
