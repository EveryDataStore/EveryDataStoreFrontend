import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppMenuItemComponent } from './app-menu-item.component';

describe('AppMenuItemComponent', () => {
  let component: AppMenuItemComponent;
  let fixture: ComponentFixture<AppMenuItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AppMenuItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMenuItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
