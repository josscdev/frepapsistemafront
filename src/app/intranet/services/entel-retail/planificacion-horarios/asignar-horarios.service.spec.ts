import { TestBed } from '@angular/core/testing';

import { AsignarHorariosService } from './asignar-horarios.service';

describe('AsignarHorariosService', () => {
  let service: AsignarHorariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsignarHorariosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
