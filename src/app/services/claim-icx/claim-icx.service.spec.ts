import { TestBed } from '@angular/core/testing';

import { ClaimIcxService } from './claim-icx.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ClaimIcxService', () => {
  let service: ClaimIcxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(ClaimIcxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
