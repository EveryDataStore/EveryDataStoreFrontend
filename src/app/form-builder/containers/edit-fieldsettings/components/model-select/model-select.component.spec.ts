import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModelSelectComponent } from './model-select.component';

describe('ModelSelectComponent', () => {
  let component: ModelSelectComponent;
  let fixture: ComponentFixture<ModelSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
