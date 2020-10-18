import { TestBed } from '@angular/core/testing';

import { MockScoreService } from './mock-score.service';

describe('MockScoreService', () => {
  let service: MockScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
