import { TestBed } from '@angular/core/testing';

import { IconexApiService } from './iconex-api.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {HttpClient} from "@angular/common/http";

describe('IconexApiService', () => {
  let service: IconexApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule],
    });
    service = TestBed.inject(IconexApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
