import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminModelItemComponent } from './admin-model-item.component';

describe('EditModelItemComponent', () => {
  let component: AdminModelItemComponent;
  let fixture: ComponentFixture<AdminModelItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminModelItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminModelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
