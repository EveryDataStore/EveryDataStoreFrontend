import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AdminModelItemsComponent } from './admin-model-items.component';

describe('AdminModelItemsComponent', () => {
  let component: AdminModelItemsComponent;
  let fixture: ComponentFixture<AdminModelItemsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminModelItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminModelItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
