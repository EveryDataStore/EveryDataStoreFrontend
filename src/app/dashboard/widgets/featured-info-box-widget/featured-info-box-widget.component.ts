import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TableModule} from 'primeng/table';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-featured-info-box-widget',
    standalone: true,
    imports: [CardModule, ButtonModule, TableModule, NgIf],
    templateUrl: './featured-info-box-widget.component.html',
    styleUrl: './featured-info-box-widget.component.scss',
})
export class FeaturedInfoBoxWidgetComponent extends BaseWidgetComponent {}
