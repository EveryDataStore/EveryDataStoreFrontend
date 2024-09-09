import { ApiErrorInterceptor } from './api-error-interceptor';
import { TestBed } from "@angular/core/testing";

describe('ApiErrorInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const interceptor: ApiErrorInterceptor = TestBed.get(ApiErrorInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
