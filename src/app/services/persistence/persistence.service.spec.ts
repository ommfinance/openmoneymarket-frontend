import { TestBed } from '@angular/core/testing';

import { PersistenceService } from './persistence.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('PersistanceServiceService', () => {
  let service: PersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(PersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
