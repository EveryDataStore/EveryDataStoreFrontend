import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecordItemVersionsComponent } from './record-item-versions.component';

describe('RecordItemVersionsComponent', () => {
  let component: RecordItemVersionsComponent;
  let fixture: ComponentFixture<RecordItemVersionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordItemVersionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordItemVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
