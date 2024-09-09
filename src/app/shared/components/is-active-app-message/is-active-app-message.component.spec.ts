import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsActiveAppMessageComponent } from './is-active-app-message.component';

describe('IsActiveAppMessageComponent', () => {
  let component: IsActiveAppMessageComponent;
  let fixture: ComponentFixture<IsActiveAppMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IsActiveAppMessageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IsActiveAppMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
