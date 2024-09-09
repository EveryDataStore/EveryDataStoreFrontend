import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecordItemNotesComponent } from './record-item-notes.component';

describe('RecordItemNotesComponent', () => {
  let component: RecordItemNotesComponent;
  let fixture: ComponentFixture<RecordItemNotesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordItemNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordItemNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
