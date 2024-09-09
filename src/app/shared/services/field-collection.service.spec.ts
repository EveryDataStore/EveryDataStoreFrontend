import { TestBed } from '@angular/core/testing';

import { FieldCollectionService } from './field-collection.service';

describe('FieldCollectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FieldCollectionService = TestBed.get(FieldCollectionService);
    expect(service).toBeTruthy();
  });
});
