import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ChartModule} from "primeng/chart";
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-doughnut-chart-widget',
    standalone: true,
    imports: [CardModule, ChartModule],
    templateUrl: './doughnut-chart-widget.component.html',
    styleUrl: './doughnut-chart-widget.component.scss'
})
export class DoughnutChartWidgetComponent extends BaseWidgetComponent {}
