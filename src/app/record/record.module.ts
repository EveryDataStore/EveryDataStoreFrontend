import {FullCalendarModule} from '@fullcalendar/angular';
import {TranslateModule} from '@ngx-translate/core';
import {FormBuilderModule} from './../form-builder/form-builder.module';
import {PrimeNGModule} from './../primeng.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EditRecordComponent} from './edit-record/edit-record.component';
import {FormsModule} from '@angular/forms';
import {ItemsComponent} from './items/items.component';
import {ItemComponent} from './item/item/item.component';
import {RecordsComponent} from './records/records.component';
import {RouterModule} from '@angular/router';

// import plugin module
import {PluginsModule} from '../plugins/plugins.module';
import {TaskDeleteCheckModalComponent} from './item/item/task-delete-check-modal/task-delete-check-modal.component';
import {TaskStatusUpdateModalComponent} from './item/item/task-status-update-modal/task-status-update-modal.component';

import {ItemViewComponent} from './item/item-view/item-view.component';
import {SharedModule} from '../shared/shared.module';
import {EditRecordVersionsComponent} from './edit-record-versions/edit-record-versions.component';
import {RecordItemVersionsComponent} from './item/item/record-item-versions/record-item-versions.component';
import {RecordItemNotesComponent} from './item/item/record-item-notes/record-item-notes.component';
import {ItemsTableModule} from '../items-table/items-table.module';
import {AvatarModule} from 'primeng/avatar';
import {FilterDialogComponent} from './items/filter-dialog/filter-dialog.component';

@NgModule({
    declarations: [
        EditRecordComponent,
        ItemsComponent,
        ItemComponent,
        RecordsComponent,
        ItemViewComponent,
        TaskDeleteCheckModalComponent,
        TaskStatusUpdateModalComponent,
        EditRecordVersionsComponent,
        RecordItemVersionsComponent,
        RecordItemNotesComponent,
    ],
    exports: [ItemComponent],
    imports: [
        FullCalendarModule,
        CommonModule,
        SharedModule,
        RouterModule,
        PrimeNGModule,
        FormsModule,
        FormBuilderModule,
        TranslateModule,
        PluginsModule,
        ItemsTableModule,
        AvatarModule,
        FilterDialogComponent,
    ],
})
export class RecordModule {}
