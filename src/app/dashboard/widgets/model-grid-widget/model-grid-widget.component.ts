import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {TableModule} from 'primeng/table';
import {RouterLink} from '@angular/router';
import {ButtonModule} from 'primeng/button';

@Component({
    selector: 'app-model-grid-widget',
    standalone: true,
    imports: [CardModule, TableModule, RouterLink, ButtonModule],
    templateUrl: './model-grid-widget.component.html',
    styleUrl: './model-grid-widget.component.scss',
})
export class ModelGridWidgetComponent extends BaseWidgetComponent {
    public static canShow() {
        return true;
    }
}
