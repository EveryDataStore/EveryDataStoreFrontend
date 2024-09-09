import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DropdownSelectFieldComponent } from './dropdown-select-field.component';

describe('DropdownSelectFieldComponent', () => {
  let component: DropdownSelectFieldComponent;
  let fixture: ComponentFixture<DropdownSelectFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownSelectFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
