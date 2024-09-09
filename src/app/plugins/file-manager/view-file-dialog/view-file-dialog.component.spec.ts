import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFileDialogComponent } from './view-file-dialog.component';

describe('ViewFileDialogComponent', () => {
  let component: ViewFileDialogComponent;
  let fixture: ComponentFixture<ViewFileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewFileDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
