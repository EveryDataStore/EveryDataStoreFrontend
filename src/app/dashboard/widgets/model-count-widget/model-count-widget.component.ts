import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';

@Component({
    selector: 'app-model-count',
    standalone: true,
    imports: [CardModule],
    templateUrl: './model-count-widget.component.html',
    styleUrl: './model-count-widget.component.scss',
})
export class ModelCountWidgetComponent extends BaseWidgetComponent {}
