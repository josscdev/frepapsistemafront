import { TestBed } from '@angular/core/testing';

import { AsignarTurnosService } from './asignar-turnos.service';

describe('AsignarTurnosService', () => {
  let service: AsignarTurnosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignarTurnosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
