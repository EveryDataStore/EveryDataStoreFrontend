import { TestBed } from '@angular/core/testing';

import { SettingValuesChangeService } from './setting-values-change.service';

describe('SettingValuesChangeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SettingValuesChangeService = TestBed.get(SettingValuesChangeService);
    expect(service).toBeTruthy();
  });
});
