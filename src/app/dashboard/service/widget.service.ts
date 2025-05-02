import {inject, Injectable} from '@angular/core';
import {RoutingService} from '../../shared/services/routing.service';
import { Widget } from '../../shared/models/entities/widget';
import { ApiService } from '../../shared/services/api.service';

@Injectable({
    providedIn: 'root',
})
export class WidgetService {
    #routingService = inject(RoutingService);
    #apiService = inject(ApiService);

    public onModelGridSelect(event, modelName) {
        this.#routingService.toAdminModelItemEdit(modelName, event.data.Slug);
    }

    public async onNewRecordItemClicked(widget: Widget) {
        const itemSlug = await this.#apiService.createRecordItem(widget.WidgetData.Slug);
        await this.#routingService.toRecordItemEdit(itemSlug);
    }

    public async onSearchRecordClicked(widget: Widget) {
        await this.#routingService.toRecordItemsList(widget.WidgetData.Slug, 1, '');
    }

    public async onRecordGridRowClicked(slug, taskSlug = null, definitionSlug = null) {
        if (taskSlug != null && definitionSlug != null) {
            return this.#routingService.toRecordItemEdit(slug, {
                task: taskSlug,
                definition: definitionSlug,
                type: 'workflow',
            });
        }

        await this.#routingService.toRecordItemView(slug, null, 0);
    }
}
