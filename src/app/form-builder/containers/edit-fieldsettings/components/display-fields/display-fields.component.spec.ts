import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DisplayFieldsComponent } from './display-fields.component';

describe('DisplayFieldsComponent', () => {
  let component: DisplayFieldsComponent;
  let fixture: ComponentFixture<DisplayFieldsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayFieldsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
