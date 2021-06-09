import { TestBed } from '@angular/core/testing';

import { DataLoaderService } from './data-loader.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('DataLoaderService', () => {
  let service: DataLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(DataLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
