import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoughnutChartWidgetComponent } from './doughnut-chart-widget.component';

describe('DoughnutChartWidgetComponent', () => {
  let component: DoughnutChartWidgetComponent;
  let fixture: ComponentFixture<DoughnutChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoughnutChartWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DoughnutChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
