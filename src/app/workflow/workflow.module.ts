import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

//import components
import { WorkflowComponent } from './workflow.component';
import { EveryWorkflowDefinitionComponent } from './every-workflow-definition/every-workflow-definition.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { TasksComponent } from './tasks/tasks.component';

//import plugin module
import { PluginsModule } from './../plugins/plugins.module';
import { SharedModule } from '../shared/shared.module';
import { FormBuilderModule } from './../form-builder/form-builder.module';
import { PrimeNGModule } from './../primeng.module';


@NgModule({
  declarations: [TasksComponent, WorkflowComponent, EveryWorkflowDefinitionComponent, TaskEditComponent],
  imports: [
    CommonModule, RouterModule, PrimeNGModule, FormsModule, FormBuilderModule, TranslateModule, PluginsModule, SharedModule
  ]
})
export class WorkflowModule {
}
