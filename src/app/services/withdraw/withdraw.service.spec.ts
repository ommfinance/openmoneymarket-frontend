import { TestBed } from '@angular/core/testing';

import { WithdrawService } from './withdraw.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('WithdrawService', () => {
  let service: WithdrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(WithdrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
