import {Component, inject, input} from '@angular/core';
import {Permissions} from '../../../shared/services/permissions.service';
import {Member} from '../../../shared/models/entities/member';
import {Widget} from '../../../shared/models/entities/widget';
import {WidgetService} from '../../service/widget.service';

@Component({
    selector: 'app-base-widget',
    standalone: true,
    imports: [],
    template: '',
    styleUrl: './base-widget.component.scss',
})
export class BaseWidgetComponent {
    public permissions = input<Permissions>();
    public user = input<Member>();
    public widgetConfig = input<any>();
    public widget = input<Widget>();

    public widgetService = inject(WidgetService);

    public static canShow(widget: Widget, user: Member, permissions: Permissions) {
        return widget.WidgetData !== undefined;
    }
}
