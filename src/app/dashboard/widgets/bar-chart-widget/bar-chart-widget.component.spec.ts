import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartWidgetComponent } from './bar-chart-widget.component';

describe('BarChartWidgetComponent', () => {
  let component: BarChartWidgetComponent;
  let fixture: ComponentFixture<BarChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BarChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
