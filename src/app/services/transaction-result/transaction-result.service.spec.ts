import { TestBed } from '@angular/core/testing';

import { TransactionResultService } from './transaction-result.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('TransactionResultService', () => {
  let service: TransactionResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(TransactionResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
