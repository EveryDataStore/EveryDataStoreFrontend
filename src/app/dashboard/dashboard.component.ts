import { BusyService } from './../shared/services/busy.service';
import { ApiService } from './../shared/services/api.service';
import { RoutingService } from './../shared/services/routing.service';
import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, NgZone } from '@angular/core';
import { LanguageService } from 'src/app/shared/services/language.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    widgetList: any;

    constructor(private routingService: RoutingService,
                private apiService: ApiService,
                private busyService: BusyService,
                private languageService: LanguageService,
                private ngZone: NgZone) { }

    onModelGridSelect(event, modelName) {
      this.routingService.toAdminModelItemEdit(modelName, event.data.Slug);
    }

    async ngOnInit() {
      this.busyService.show();
      this.widgetList = await this.apiService.getEveryWidget();
      console.log(this.widgetList);
      this.busyService.hide();
     
    }

    async onRecordGridRow(slug, taskSlug = null, definitionSlug = null){
        if(taskSlug!= null && definitionSlug != null){
            return this.routingService.toRecordItemEdit(slug,  {'task': taskSlug, 'definition': definitionSlug, 'type': 'workflow' });
        }

        this.routingService.toRecordItemView(slug, null, 0);
    }

     async onNewRecordItemClicked(recordSlug) {
    const itemSlug = await this.apiService.createRecordItem(recordSlug);
    await this.routingService.toRecordItemEdit(itemSlug);
  }
    
    async onSearchRecordClicked(recordSlug) {
    await this.routingService.toRecordItemsList(recordSlug, 1, '');
  }
    
}
