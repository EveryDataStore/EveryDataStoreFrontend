import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsTableComponent } from './items-table/items-table.component';
import { PrimeNGModule } from '../primeng.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicDialogModule } from 'primeng/dynamicdialog';

@NgModule({
  declarations: [
    ItemsTableComponent
  ],
  exports: [
    ItemsTableComponent
  ],
  imports: [
    CommonModule, PrimeNGModule, TranslateModule, FormsModule, ReactiveFormsModule, DynamicDialogModule
  ]
})
export class ItemsTableModule { }
