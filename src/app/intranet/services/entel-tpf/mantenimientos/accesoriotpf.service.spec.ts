import { TestBed } from '@angular/core/testing';

import { AccesoriotpfService } from './accesoriotpf.service';

describe('AccesoriotpfService', () => {
  let service: AccesoriotpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccesoriotpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
