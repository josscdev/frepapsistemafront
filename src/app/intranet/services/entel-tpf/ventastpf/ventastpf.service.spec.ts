import { TestBed } from '@angular/core/testing';

import { VentastpfService } from './ventastpf.service';

describe('VentastpfService', () => {
  let service: VentastpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VentastpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
