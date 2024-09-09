import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TexteditorFieldComponent } from './texteditor-field.component';

describe('TexteditorFieldComponent', () => {
  let component: TexteditorFieldComponent;
  let fixture: ComponentFixture<TexteditorFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TexteditorFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TexteditorFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
