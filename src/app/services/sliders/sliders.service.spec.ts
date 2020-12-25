import { TestBed } from '@angular/core/testing';

import { SlidersService } from './sliders.service';

describe('UsdbSlidersService', () => {
  let service: SlidersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlidersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
