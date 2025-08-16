import { TestBed } from '@angular/core/testing';

import { PermisosLimtekService } from './permisos-limtek.service';

describe('PermisosLimtekService', () => {
  let service: PermisosLimtekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermisosLimtekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
