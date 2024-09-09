import { TranslateModule } from '@ngx-translate/core';
import { FormBuilderModule } from '../form-builder/form-builder.module';
import { PrimeNGModule } from '../primeng.module';
import { SharedModule } from '../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminModelItemComponent } from './admin-model-item/admin-model-item.component';
import { RouterModule } from '@angular/router';
import { AdminModelItemsComponent } from './admin-model-items/admin-model-items.component';
import { AccountComponent } from './account/account.component';
import { ItemsTableModule } from '../items-table/items-table.module';


@NgModule({
  declarations: [AdminModelItemComponent, AdminModelItemsComponent, AccountComponent],
  imports: [
    CommonModule, SharedModule, PrimeNGModule, RouterModule, TranslateModule, FormBuilderModule, ItemsTableModule
  ]
})
export class AdminModule {
}
