import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TabSectionComponent } from './tab-section.component';

describe('TabSectionComponent', () => {
  let component: TabSectionComponent;
  let fixture: ComponentFixture<TabSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TabSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
