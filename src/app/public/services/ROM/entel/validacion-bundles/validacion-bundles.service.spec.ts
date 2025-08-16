import { TestBed } from '@angular/core/testing';

import { ValidacionBundlesService } from './validacion-bundles.service';

describe('ValidacionBundlesService', () => {
  let service: ValidacionBundlesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidacionBundlesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
