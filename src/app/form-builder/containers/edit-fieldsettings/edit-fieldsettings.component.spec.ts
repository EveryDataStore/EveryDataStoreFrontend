import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditFieldsettingsComponent } from './edit-fieldsettings.component';

describe('EditFieldsettingsComponent', () => {
  let component: EditFieldsettingsComponent;
  let fixture: ComponentFixture<EditFieldsettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFieldsettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFieldsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
