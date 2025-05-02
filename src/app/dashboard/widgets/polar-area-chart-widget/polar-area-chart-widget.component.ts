import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ChartModule} from "primeng/chart";


@Component({
  selector: 'app-polar-area-chart-widget',
  standalone: true,
  imports: [CardModule, ChartModule],
  templateUrl: './polar-area-chart-widget.component.html',
  styleUrl: './polar-area-chart-widget.component.scss'
})
export class PolarAreaChartWidgetComponent extends BaseWidgetComponent {}
