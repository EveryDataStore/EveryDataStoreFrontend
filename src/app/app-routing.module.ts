import { AdminModelItemsComponent } from './admin/admin-model-items/admin-model-items.component';
import { AdminModelItemComponent } from './admin/admin-model-item/admin-model-item.component';
import { ItemComponent } from './record/item/item/item.component';
import { ItemsComponent } from './record/items/items.component';
import { EditRecordComponent } from './record/edit-record/edit-record.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Injector, NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { LoginPageComponent } from './auth/login-page/login-page.component';
import { AppMainComponent } from './app-main.component';
import { AuthGuardService } from './auth/services/auth-guard.service';
import { RecordsComponent } from './record/records/records.component';
import { AccountComponent } from './admin/account/account.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './auth/recover-password/recover-password.component';
import { FileManagerComponent } from 'src/app/plugins/file-manager/file-manager.component';
import { environment } from 'src/environments/environment';

const routes: Routes = [
  {
    path: '',
    component: AppMainComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: '',
        redirectTo: 'dashboard', pathMatch: 'full',
        data: { homepage: false }
      },
      {
        path: 'records',
        component: RecordsComponent
      },
      {
        path: 'record/build',
        component: EditRecordComponent
      },
      {
        path: 'record/:slug/build',
        component: EditRecordComponent
      },
      {
        path: 'record/:slug/build/:recordVersion',
        component: EditRecordComponent
      },
      {
        path: 'record/items/:recordSlug',
        component: ItemsComponent
      },
      {
        path: 'record/item/:itemSlug/edit',
        component: ItemComponent,
        data: { mode: 'edit' },
        runGuardsAndResolvers: 'always'
      },
      {
        path: 'record/item/:itemSlug/view/:apitoken',
        component: ItemComponent,
        data: { mode: 'view' }
      },
      {
        path: 'record/item/:itemSlug',
        component: ItemComponent,
        data: { mode: 'view' }
      },
      {
        path: 'record/item/:itemSlug/:recordItemVersion',
        component: ItemComponent,
        data: { mode: 'view' }
      },
      {
        path: 'admin/:modelName',
        component: AdminModelItemsComponent
      },
      {
        path: 'admin/:modelName/edit/:objectSlug',
        component: AdminModelItemComponent
      },
      {
        path: 'admin/:modelName/new-item',
        component: AdminModelItemComponent
      },
      {
        path: 'account/:type',
        component: AccountComponent
      },
      {
        path: 'workflow',
        component: WorkflowComponent
      },
      {
        path: 'workflow/tasks/:Slug',
        component: WorkflowComponent
      },
      {
        path: 'filemanager/:slug',
        component: FileManagerComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'setpassword',
    component: RecoverPasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    onSameUrlNavigation: 'reload'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

export function loadRoutes(injector: Injector) {
  return () => {
      const mode = environment.mode;
      let filteredRoutes: Routes;
      if (mode === 'homepage') {
        filteredRoutes = routes.filter(route => {
          if (route.data && route.data.homepage && route.data.homepage === false) {
            return false;
          }
          return true;
        });
      } else {
        filteredRoutes = routes.filter((route) => !route.data?.homepage);
      }
      const router: Router = injector.get(Router);
      router.resetConfig(filteredRoutes);
    };
}
