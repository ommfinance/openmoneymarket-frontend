import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
