import { TestBed } from '@angular/core/testing';

import { StateChangeService } from './state-change.service';

describe('StateChangeService', () => {
  let service: StateChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
