import { TestBed } from '@angular/core/testing';

import { ReloaderService } from './reloader.service';

describe('ReloaderService', () => {
  let service: ReloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
