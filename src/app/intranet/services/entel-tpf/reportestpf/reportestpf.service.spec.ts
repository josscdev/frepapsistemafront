import { TestBed } from '@angular/core/testing';

import { ReportestpfService } from './reportestpf.service';

describe('ReportestpfService', () => {
  let service: ReportestpfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportestpfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
