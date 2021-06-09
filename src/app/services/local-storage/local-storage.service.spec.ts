import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('LocalstorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
