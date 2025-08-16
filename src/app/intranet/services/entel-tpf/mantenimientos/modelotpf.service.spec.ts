import { TestBed } from '@angular/core/testing';

import { ModelotpfService } from './modelotpf.service';

describe('ModelotpfService', () => {
  let service: ModelotpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelotpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
