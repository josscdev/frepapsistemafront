import { TestBed } from '@angular/core/testing';

import { PermisosTawaService } from './permisos-tawa.service';

describe('PermisosTawaService', () => {
  let service: PermisosTawaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermisosTawaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
