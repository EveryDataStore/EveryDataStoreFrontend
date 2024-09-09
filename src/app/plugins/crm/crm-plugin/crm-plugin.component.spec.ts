import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CrmPluginComponent } from './crm-plugin.component';

describe('CrmPluginComponent', () => {
  let component: CrmPluginComponent;
  let fixture: ComponentFixture<CrmPluginComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CrmPluginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmPluginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
