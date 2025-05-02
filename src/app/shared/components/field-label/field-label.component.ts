import {FormMetaField} from 'src/app/shared/models/entities/form-meta-field';
import {Component, computed, input, Input, OnInit} from '@angular/core';
import {FieldType} from '../../models/field-type';
import {FormMode} from '../../../form-builder/form-builder.component';
import {FieldSettings} from '../../models/field-settings/field-setting';

@Component({
    selector: 'app-field-label',
    templateUrl: './field-label.component.html',
    styleUrls: ['./field-label.component.scss'],
})
export class FieldLabelComponent implements OnInit {
    public field = input.required<FormMetaField>();
    public formMode = input<FormMode>();
    public checkForVisibility = input(true);

    protected readonly fieldType = FieldType;
    protected readonly FieldSettings = FieldSettings;

    public inBuildMode = computed(() => this.formMode() === FormMode.Build);

    ngOnInit(): void {}
}
