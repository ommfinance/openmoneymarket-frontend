import { TestBed } from '@angular/core/testing';

import { CheckerService } from './checker.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('CheckerService', () => {
  let service: CheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(CheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
