import { TestBed } from '@angular/core/testing';

import { OmmService } from './omm.service';

describe('OmmService', () => {
  let service: OmmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OmmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
