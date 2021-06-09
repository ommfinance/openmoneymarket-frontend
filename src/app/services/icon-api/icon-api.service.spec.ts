import { TestBed } from '@angular/core/testing';

import { IconApiService } from './icon-api.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('IconServiceService', () => {
  let service: IconApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(IconApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
