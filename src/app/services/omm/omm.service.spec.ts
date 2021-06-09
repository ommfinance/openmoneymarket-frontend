import { TestBed } from '@angular/core/testing';

import { OmmService } from './omm.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('OmmService', () => {
  let service: OmmService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(OmmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
