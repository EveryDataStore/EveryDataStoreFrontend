import {Permissions, PermissionsService} from '../shared/services/permissions.service';
import {BusyService} from '../shared/services/busy.service';
import {ApiService} from '../shared/services/api.service';
import { Component, inject, Injector, OnInit } from '@angular/core';
import {WidgetLoader} from './widget-loader';
import {Widget} from '../shared/models/entities/widget';
import {isNil} from 'ngx-cookie';
import {BaseWidgetComponent} from './widgets/base-widget/base-widget.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    public widgetList: any;
    public user: any;
    public permissions: Permissions = new Permissions();
    public time = new Date();

    public widgetLoader = WidgetLoader;
    #injector = inject(Injector);

    constructor(
        private apiService: ApiService,
        private busyService: BusyService,
        private permissionsService: PermissionsService
    ) {}

    async ngOnInit() {
        this.busyService.show();
        this.user = await this.apiService.getUserInfo();
        this.widgetList = await this.apiService.getEveryWidget();
        this.permissions = await this.permissionsService.getPermissionsForModel('RecordItem');
        this.busyService.hide();
    }

    public canShow(widget: Widget): boolean {
        const component = this.widgetLoader.getWidget(widget.Type);
        if (component) {
            return (component as typeof BaseWidgetComponent).canShow(widget, this.user, this.permissions);
        }
        return false;
    }

    public getWidgetInput(widgetData: any) {
        const inputData = {
            permissions: this.permissions,
            user: this.user,
            widget: widgetData,
        };

        if (widgetData) {
            if (widgetData.Configurations[0]?.Value) {
                try {
                    inputData['widgetConfig'] = JSON.parse(widgetData.Configurations[0].Value);
                } catch (e) {}
            }
        }

        return inputData;
    }
}
