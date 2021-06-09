import { TestBed } from '@angular/core/testing';

import { BorrowService } from './borrow.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BorrowService', () => {
  let service: BorrowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(BorrowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
