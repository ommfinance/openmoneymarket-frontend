import { TestBed } from '@angular/core/testing';

import { RepayService } from './repay.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('RepayService', () => {
  let service: RepayService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(RepayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
