import { TestBed } from '@angular/core/testing';

import { BridgeWidgetService } from './bridge-widget.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BridgeWidgetService', () => {
  let service: BridgeWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
    });
    service = TestBed.inject(BridgeWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
