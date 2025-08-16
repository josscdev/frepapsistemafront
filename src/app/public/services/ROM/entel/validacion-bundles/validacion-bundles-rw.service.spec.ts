import { TestBed } from '@angular/core/testing';

import { ValidacionBundlesRWService } from './validacion-bundles-rw.service';

describe('ValidacionBundlesRWService', () => {
  let service: ValidacionBundlesRWService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidacionBundlesRWService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
