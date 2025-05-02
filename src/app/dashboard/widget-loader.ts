import {TimetrackerWidgetComponent} from './widgets/timetracker-widget/timetracker-widget.component';
import {Component, Type} from '@angular/core';
import {BaseWidgetComponent} from './widgets/base-widget/base-widget.component';
import {ModelGridWidgetComponent} from './widgets/model-grid-widget/model-grid-widget.component';
import {RecordGridWidgetComponent} from './widgets/record-grid-widget/record-grid-widget.component';
import {ModelCountWidgetComponent} from './widgets/model-count-widget/model-count-widget.component';
import {RecordCountWidgetComponent} from './widgets/record-count-widget/record-count-widget.component';
import {FeaturedInfoBoxWidgetComponent} from './widgets/featured-info-box-widget/featured-info-box-widget.component';
import {LastLoginWidgetComponent} from './widgets/last-login-widget/last-login-widget.component';
import {UploadButtonWidgetComponent} from './widgets/upload-button-widget/upload-button-widget.component';
import {DoughnutChartWidgetComponent} from './widgets/doughnut-chart-widget/doughnut-chart-widget.component';
import {PolarAreaChartWidgetComponent} from './widgets/polar-area-chart-widget/polar-area-chart-widget.component';
import {PieChartWidgetComponent} from './widgets/pie-chart-widget/pie-chart-widget.component';
import {BarChartWidgetComponent} from './widgets/bar-chart-widget/bar-chart-widget.component';
import {LinearChartWidgetComponent} from './widgets/linear-chart-widget/linear-chart-widget.component';

const widgetComponents: {[key: string]: Type<BaseWidgetComponent>} = {
    timeTracker: TimetrackerWidgetComponent,
    modelGrid: ModelGridWidgetComponent,
    recordGrid: RecordGridWidgetComponent,
    modelCount: ModelCountWidgetComponent,
    recordCount: RecordCountWidgetComponent,
    featuredInfoBox: FeaturedInfoBoxWidgetComponent,
    lastLogin: LastLoginWidgetComponent,
    uploadButton: UploadButtonWidgetComponent,
    doughnutChart: DoughnutChartWidgetComponent,
    polarAreaChart: PolarAreaChartWidgetComponent,
    pieChart: PieChartWidgetComponent,
    barChart: BarChartWidgetComponent,
    linearChart: LinearChartWidgetComponent
};

export class WidgetLoader {
    public static getWidget(widgetName: string): Type<BaseWidgetComponent> {
        return widgetComponents[widgetName];
    }
}
