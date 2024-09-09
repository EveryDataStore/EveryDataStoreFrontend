
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { PrimeNGModule } from '../primeng.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { SafePipe } from './safe.pipe';
import { IsActiveAppMessageComponent } from './components/is-active-app-message/is-active-app-message.component';
import { SaveCancelButtonsComponent } from './components/save-cancel-buttons/save-cancel-buttons.component';
import { FieldLabelComponent } from './components/field-label/field-label.component';

@NgModule({
  declarations: [
    SafePipe, IsActiveAppMessageComponent, SaveCancelButtonsComponent, FieldLabelComponent
  ],
  imports: [
    CommonModule, PrimeNGModule, FormsModule, BrowserModule, TranslateModule
  ],
  exports: [
    BrowserModule,
    PrimeNGModule,
    SafePipe,
    IsActiveAppMessageComponent,
    SaveCancelButtonsComponent,
    FieldLabelComponent
  ]
})
export class SharedModule { }
