import { TestBed } from '@angular/core/testing';

import { DatasharingLimtekService } from './datasharing-limtek.service';

describe('DatasharingLimtekService', () => {
  let service: DatasharingLimtekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatasharingLimtekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
