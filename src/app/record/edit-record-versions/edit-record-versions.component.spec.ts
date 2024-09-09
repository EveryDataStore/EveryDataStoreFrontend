import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditRecordVersionsComponent } from './edit-record-versions.component';

describe('EditRecordVersionsComponent', () => {
  let component: EditRecordVersionsComponent;
  let fixture: ComponentFixture<EditRecordVersionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRecordVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRecordVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
