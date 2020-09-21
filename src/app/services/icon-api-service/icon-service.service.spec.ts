import { TestBed } from '@angular/core/testing';

import { IconApiService } from './icon-api.service';

describe('IconServiceService', () => {
  let service: IconApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
