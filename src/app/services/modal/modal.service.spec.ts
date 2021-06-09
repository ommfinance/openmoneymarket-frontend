import { TestBed } from '@angular/core/testing';

import { ModalService } from './modal.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
