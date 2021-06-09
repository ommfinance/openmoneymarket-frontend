import { TestBed } from '@angular/core/testing';

import { LedgerService } from './ledger.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(LedgerService);
  });
});
