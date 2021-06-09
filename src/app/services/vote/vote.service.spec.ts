import { TestBed } from '@angular/core/testing';

import { VoteService } from './vote.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('VoteService', () => {
  let service: VoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(VoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
