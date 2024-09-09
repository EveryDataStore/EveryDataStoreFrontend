import { TestBed } from '@angular/core/testing';

import { ServicesProviderService } from './services-provider.service';

describe('ServicesProviderService', () => {
  let service: ServicesProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
