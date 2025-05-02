import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-record-grid-widget',
    standalone: true,
    imports: [CardModule, ButtonModule, TableModule, NgIf],
    templateUrl: './record-grid-widget.component.html',
    styleUrl: './record-grid-widget.component.scss',
})
export class RecordGridWidgetComponent extends BaseWidgetComponent {}
