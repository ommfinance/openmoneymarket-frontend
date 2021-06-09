import { TestBed } from '@angular/core/testing';

import { StateChangeService } from './state-change.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('StateChangeService', () => {
  let service: StateChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(StateChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
