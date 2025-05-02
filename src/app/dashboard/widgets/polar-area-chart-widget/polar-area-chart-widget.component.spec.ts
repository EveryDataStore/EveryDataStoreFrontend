import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolarAreaChartWidgetComponent } from './polar-area-chart-widget.component';

describe('PolarAreaChartWidgetComponent', () => {
  let component: PolarAreaChartWidgetComponent;
  let fixture: ComponentFixture<PolarAreaChartWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolarAreaChartWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PolarAreaChartWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
