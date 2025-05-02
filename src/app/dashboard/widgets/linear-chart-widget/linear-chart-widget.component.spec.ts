import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinearChartWidgetComponent } from './linear-chart-widget.component';

describe('LinearChartWidgetComponent', () => {
  let component: LinearChartWidgetComponent;
  let fixture: ComponentFixture<LinearChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinearChartWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LinearChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
