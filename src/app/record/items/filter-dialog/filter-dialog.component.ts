import { Component, effect, inject, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { isEmpty } from 'lodash';
import { ApiService } from '../../../shared/services/api.service';
import { BusyService } from '../../../shared/services/busy.service';
import { FormMetaField } from '../../../shared/models/entities/form-meta-field';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '../../../shared/models/field-type';
import { FormBuilderModule } from '../../../form-builder/form-builder.module';
import { FormMode } from '../../../form-builder/form-builder.component';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';

@Component({
    selector: 'app-filter-dialog',
    standalone: true,
    imports: [DialogModule, ButtonModule, TranslateModule, SharedModule, ReactiveFormsModule, FormBuilderModule],
    templateUrl: './filter-dialog.component.html',
    styleUrl: './filter-dialog.component.scss',
})
export class FilterDialogComponent {
    public dialogVisible = input(false);
    public fields = input<FormMetaField[]>([]);

    public visibleChange = output<boolean>();
    public filter = output<Map<string, string>>();

    #formBuilder = inject(FormBuilder);

    public fieldCollectionService: FieldCollectionService = new FieldCollectionService();

    public form: FormGroup = this.#formBuilder.group({});
    protected readonly fieldType = FieldType;
    protected readonly FormMode = FormMode;

    public constructor() {
        this.fieldCollectionService.clear();
    }

    public onOkClicked() {
        const result = new Map<string, string>();

        this.fields().forEach(field => {
            const value = this.fieldCollectionService.getFieldValue(field.Slug);
            if (!isEmpty(value)) {
                result.set(field.slug, value);
            }
        });

        this.visibleChange.emit(false);
        this.filter.emit(result);
    }

    public onClearClicked() {
        this.fields().forEach(field => {
            this.fieldCollectionService.findByFieldSlug(field.Slug).clear();
        });
    }
}
