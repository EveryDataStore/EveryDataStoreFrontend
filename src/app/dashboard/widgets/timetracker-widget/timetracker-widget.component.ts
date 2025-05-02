import { Component, inject, OnInit, signal } from '@angular/core';
import { BaseWidgetComponent } from '../base-widget/base-widget.component';
import { CardModule } from 'primeng/card';
import { RecordItem, RecordItemFieldValue } from '../../../shared/models/entities/record-item';
import { ApiService } from '../../../shared/services/api.service';
import { BusyService } from '../../../shared/services/busy.service';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe, NgIf } from '@angular/common';
import { Widget } from '../../../shared/models/entities/widget';
import { Member } from '../../../shared/models/entities/member';
import {Permissions} from '../../../shared/services/permissions.service';
import { GetRecordItemsParams } from '../../../shared/services/params/get-record-items-params';
import { Builder } from 'builder-pattern';

@Component({
    selector: 'app-timetracker-widget',
    standalone: true,
    imports: [CardModule, ButtonModule, TranslateModule, DatePipe, NgIf],
    templateUrl: './timetracker-widget.component.html',
    styleUrl: './timetracker-widget.component.scss',
})
export class TimetrackerWidgetComponent extends BaseWidgetComponent implements OnInit {
    #apiService = inject(ApiService);
    #busyService = inject(BusyService);

    public showCheckInButton: boolean;
    public showCheckOutButton: boolean;
    public checkInOutItemSlug: any;
    public defaultDateTimeFormat: string;
    public timeReport = {};
    public time = new Date();
    public intervalId;

    public static canShow(widget: Widget, user: Member, permissions: Permissions) {
        return user.CreatePersonnelFile === 1 && permissions.canCreate;
    }

    public ngOnInit(): void {
        this.showCheckInButton = true;
        this.intervalId = setInterval(() => {
            this.time = new Date();
        }, 1000);

        this.defaultDateTimeFormat = this.user().Settings.DateTimeFormat;
        this.getCheckInOutItemSlug();
        this.getTimeReport();
    }

    public async onCheckInClicked() {
        await this.createCheckInOutItem(this.widgetConfig()['CheckInOut']['FieldCheckIn']);
    }

    public async onCheckOutClicked() {
        await this.createCheckInOutItem(this.widgetConfig()['CheckInOut']['FieldCheckOut']);
    }

    private async createCheckInOutItem(recordItemFieldSlug: string) {
        if (!this.permissions().canCreate) {
            return;
        }

        if (!this.checkInOutItemSlug) {
            this.checkInOutItemSlug = await this.#apiService.createRecordItem(
                this.widgetConfig()['CheckInOut'].RecordSet
            );
        }
        if (this.checkInOutItemSlug) {
            const recordItem = new RecordItem();
            recordItem.Fields.push(
                this.setRecordItemField(this.widgetConfig()['CheckInOut']['FieldMember'], this.user().Slug)
            );
            recordItem.Fields.push(this.setRecordItemField(recordItemFieldSlug, new Date().toJSON()));
            recordItem.RecordSlug = this.widgetConfig()['CheckInOut'].RecordSet;

            this.#busyService.show();
            const result = await this.#apiService.postRecordItem(this.checkInOutItemSlug, recordItem);
            this.#busyService.hide();
            await this.getTimeReport();
            if(recordItemFieldSlug == this.widgetConfig()['CheckInOut']['FieldCheckOut']){
                this.checkInOutItemSlug = null;
            }
        }
    }

    private async getTimeReport() {
        const searchTerm = new Date().toJSON().slice(0, 10) + ',CreatedBy.Slug=' + this.user().Slug;

        const recordItem = await this.#apiService.getRecordItems({
            recordSlug: this.widgetConfig()['TimeReport'].RecordSet,
            page: 1,
            count: 1,
            sortColumn: 'Created',
            searchTerm
        });

        if (recordItem && recordItem.CountItems === 1) {
            recordItem.Items[0].ItemData.forEach((element, index) => {
                if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldShouldHours']) {
                    this.timeReport['shouldHours'] = element.Value ? element.Value : '0';
                } else if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldOvertime']) {
                    this.timeReport['overtime'] = element.Value ? element.Value : '0';
                } else if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldUndertime']) {
                    this.timeReport['undertime'] = element.Value ? element.Value : '0';
                } else if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldTrackedHours']) {
                    this.timeReport['trackedHours'] = element.Value ? element.Value : '0';
                } else if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldCurrentAction']) {
                    this.timeReport['currentAction'] = element.Value ? element.Value : null;
                } else if (element.FormFieldSlug === this.widgetConfig()['TimeReport']['FieldCurrentActionTime']) {
                    this.timeReport['currentActionTime'] = element.Value ? element.Value : null;
                }
            });
        }

        if (this.timeReport['currentAction'] === 'CheckIn') {
            this.showCheckInButton = false;
            this.showCheckOutButton = true;
        } else {
            this.showCheckInButton = true;
            this.showCheckOutButton = false;
        }
    }

    /* get CheckInOutItem,
     * Status = 1, CheckOutInItem has CheckInDate and CheckOutDate => must be ignored
     * Status = 0, CheckOutInItem has only CheckInDate => can be used
     */
    private async getCheckInOutItemSlug() {
        const searchTerm = new Date().toJSON().slice(0, 10) + ',CreatedBy.Slug=' + this.user().Slug;
 
        const recordItem = await this.#apiService.getRecordItems({
            recordSlug: this.widgetConfig()['CheckInOut'].RecordSet,
            page: 1,
            count: 1,
            sortColumn: 'Created',
            searchTerm
        });

        if (recordItem && recordItem.Items && recordItem.Items[0]) {
            let Status;
            recordItem.Items[0].ItemData.forEach((element, index) => {
                if (element.FormFieldSlug === this.widgetConfig()['CheckInOut']['FieldStatus']) {
                    Status = element.Value;
                }
            });
            this.checkInOutItemSlug = Status === '1' ? '' : recordItem.Items[0].Slug;
        }
    }

    private setRecordItemField(slug: string, value: any): RecordItemFieldValue {
        const recordItemField = new RecordItemFieldValue();
        recordItemField.Slug = slug;
        recordItemField.Value = value;
        return recordItemField;
    }
}
