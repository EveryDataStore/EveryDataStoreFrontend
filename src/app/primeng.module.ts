import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DragDropModule } from 'primeng/dragdrop';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { CalendarModule } from 'primeng/calendar';
import { PasswordModule } from 'primeng/password';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';

import { RadioButtonModule } from 'primeng/radiobutton';
import { TreeModule } from 'primeng/tree';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { AccordionModule } from 'primeng/accordion';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule,
    PanelModule,
    MessagesModule,
    MessageModule,
    TableModule,
    ButtonModule,
    TabViewModule,
    InputTextModule,
    CheckboxModule,
    DropdownModule,
    MultiSelectModule,
    ToolbarModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    DragDropModule,
    InputTextareaModule,
    DialogModule,
    KeyFilterModule,
    CalendarModule,
    PasswordModule,
    ChartModule,
    CardModule,
    FileUploadModule,
    RadioButtonModule,
    TreeModule,
    SplitButtonModule,
    MenuModule,
    AccordionModule,
    DynamicDialogModule
  ],

  exports: [PanelModule,
    TableModule,
    ButtonModule,
    TabViewModule,
    InputTextModule,
    CheckboxModule,
    DropdownModule,
    MultiSelectModule,
    ToolbarModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    DragDropModule,
    InputTextareaModule,
    DialogModule,
    KeyFilterModule,
    CalendarModule,
    PasswordModule,
    ChartModule,
    CardModule,
    FileUploadModule,
    RadioButtonModule,
    TreeModule,
    SplitButtonModule,
    MenuModule,
    AccordionModule,
    DialogModule,
    DynamicDialogModule
  ]
})
export class PrimeNGModule {
}
