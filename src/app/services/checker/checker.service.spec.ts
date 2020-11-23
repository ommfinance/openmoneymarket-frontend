import { TestBed } from '@angular/core/testing';

import { CheckerService } from './checker.service';

describe('CheckerService', () => {
  let service: CheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
