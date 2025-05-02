import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ChartModule} from "primeng/chart";

@Component({
  selector: 'app-linear-chart-widget',
  standalone: true,
  imports: [CardModule, ChartModule],
  templateUrl: './linear-chart-widget.component.html',
  styleUrl: './linear-chart-widget.component.scss'
})
export class LinearChartWidgetComponent extends BaseWidgetComponent{}
