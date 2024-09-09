import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RelationFieldComponent } from './relation-field.component';

describe('RelationFieldComponent', () => {
  let component: RelationFieldComponent;
  let fixture: ComponentFixture<RelationFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RelationFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelationFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
