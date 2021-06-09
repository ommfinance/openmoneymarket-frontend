import { TestBed } from '@angular/core/testing';

import { ReloaderService } from './reloader.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ReloaderService', () => {
  let service: ReloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(ReloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
