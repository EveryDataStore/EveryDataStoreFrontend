import { TranslateModule } from '@ngx-translate/core';
import { RecordModule } from './../record/record.module';
import { RouterModule } from '@angular/router';
import { PrimeNGModule } from '../primeng.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { WorkflowModule } from '../workflow/workflow.module';
import { CanvasClockComponent } from './canvas-clock/canvas-clock.component';

@NgModule({
  declarations: [DashboardComponent, CanvasClockComponent],
  imports: [
    CommonModule, PrimeNGModule, RouterModule, RecordModule, TranslateModule, WorkflowModule
  ]
})
export class DashboardModule { }
