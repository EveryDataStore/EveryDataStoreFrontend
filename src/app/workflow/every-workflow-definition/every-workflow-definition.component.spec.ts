import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EveryWorkflowDefinitionComponent } from './every-workflow-definition.component';

describe('EveryWorkflowDefinitionComponent', () => {
  let component: EveryWorkflowDefinitionComponent;
  let fixture: ComponentFixture<EveryWorkflowDefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EveryWorkflowDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EveryWorkflowDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
