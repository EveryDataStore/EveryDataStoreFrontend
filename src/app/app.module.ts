import { DashboardModule } from './dashboard/dashboard.module';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MessageUtilService } from './shared/services/message-util.service';
import { ApiService } from './shared/services/api.service';
import { BusyService } from './shared/services/busy.service';
import { SharedModule } from './shared/shared.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { PrimeNGModule } from './primeng.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import ngx-translate and the http loader
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

// font awesome icons
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { AppRoutingModule, loadRoutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { SlugService } from './shared/services/slug.service';

import { TopbarComponent } from './layout/topbar/topbar.component';
import { AppMenuComponent } from './layout/menu/menu.component';
import { AppMenuItemComponent } from './layout/menu/app-menu-item/app-menu-item.component';
import { AuthModule } from './auth/auth.module';
import { AppMainComponent } from './app-main.component';
import { CookieModule } from 'ngx-cookie';
import { FooterComponent } from './layout/footer/footer/footer.component';
import { AdminModule } from './admin/admin.module';
import { ApiErrorInterceptor } from './shared/services/api-error-interceptor';

// import plugin module
import { PluginsModule } from './plugins/plugins.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DndModule } from './dnd/dnd.module';


@NgModule({
  declarations: [
    AppComponent,
    AppMenuComponent,
    TopbarComponent,
    AppMenuItemComponent,
    AppMainComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PrimeNGModule,
    HttpClientModule,
    SharedModule,
    DashboardModule,
    FontAwesomeModule,
    AuthModule,
    PluginsModule,
    AdminModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CookieModule.forRoot(),
    FullCalendarModule,
    DndModule.forRoot()
  ],
  providers: [
    BusyService,
    ApiService,
    MessageService,
    MessageUtilService,
    ConfirmationService,
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    SlugService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: loadRoutes,
      deps: [Injector],
      multi: true,
    }
  ],
  bootstrap: [AppComponent],
  exports: [
    AppMenuComponent
  ]
})

export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

