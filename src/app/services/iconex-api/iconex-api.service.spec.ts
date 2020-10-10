import { TestBed } from '@angular/core/testing';

import { IconexApiService } from './iconex-api.service';

describe('IconexApiService', () => {
  let service: IconexApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconexApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
