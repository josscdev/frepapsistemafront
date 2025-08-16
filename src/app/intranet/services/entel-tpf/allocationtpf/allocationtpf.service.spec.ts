import { TestBed } from '@angular/core/testing';

import { AllocationtpfService } from './allocationtpf.service';

describe('AllocationtpfService', () => {
  let service: AllocationtpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllocationtpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
