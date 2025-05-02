import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ChartModule} from "primeng/chart";

@Component({
  selector: 'app-pie-chart-widget',
  standalone: true,
  imports: [CardModule, ChartModule],
  templateUrl: './pie-chart-widget.component.html',
  styleUrl: './pie-chart-widget.component.scss'
})
export class PieChartWidgetComponent extends BaseWidgetComponent{}
