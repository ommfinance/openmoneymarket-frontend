import { TestBed } from '@angular/core/testing';

import { BridgeWidgetService } from './bridge-widget.service';

describe('BridgeWidgetService', () => {
  let service: BridgeWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BridgeWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
