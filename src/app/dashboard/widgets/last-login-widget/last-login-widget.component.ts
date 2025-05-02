import {Component} from '@angular/core';
import {BaseWidgetComponent} from '../base-widget/base-widget.component';
import {CardModule} from 'primeng/card';
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-last-login-widget',
    standalone: true,
    imports: [CardModule, DatePipe],
    templateUrl: './last-login-widget.component.html',
    styleUrl: './last-login-widget.component.scss',
})
export class LastLoginWidgetComponent extends BaseWidgetComponent {}
