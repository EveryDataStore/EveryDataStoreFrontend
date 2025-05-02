import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';

@Component({
    selector: 'app-record-count-widget',
    standalone: true,
    imports: [CardModule],
    templateUrl: './record-count-widget.component.html',
    styleUrl: './record-count-widget.component.scss',
})
export class RecordCountWidgetComponent extends BaseWidgetComponent {}
