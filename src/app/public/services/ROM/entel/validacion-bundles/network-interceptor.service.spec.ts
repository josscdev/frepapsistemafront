import { TestBed } from '@angular/core/testing';

import { NetworkInterceptorService } from './network-interceptor.service';

describe('NetworkInterceptorService', () => {
  let service: NetworkInterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
