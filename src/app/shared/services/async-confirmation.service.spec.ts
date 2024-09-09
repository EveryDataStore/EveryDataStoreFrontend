import { TestBed } from '@angular/core/testing';

import { AsyncConfirmationService } from './async-confirmation.service';

describe('AsyncConfirmationService', () => {
  let service: AsyncConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsyncConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
