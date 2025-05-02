import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ChartModule} from "primeng/chart";

@Component({
  selector: 'app-bar-chart-widget',
  standalone: true,
  imports: [CardModule, ChartModule],
  templateUrl: './bar-chart-widget.component.html',
  styleUrl: './bar-chart-widget.component.scss'
})
export class BarChartWidgetComponent extends BaseWidgetComponent{}
