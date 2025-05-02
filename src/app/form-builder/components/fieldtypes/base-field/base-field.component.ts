import {FieldCollectionService} from '../../../../shared/services/field-collection.service';
import {Component, OnInit, Input, AfterViewInit} from '@angular/core';
import {FormMetaField} from 'src/app/shared/models/entities/form-meta-field';
import {FormMode} from 'src/app/form-builder/form-builder.component';
import {FieldSettings} from '../../../../shared/models/field-settings/field-setting';

@Component({
    selector: 'app-base-field',
    templateUrl: './base-field.component.html',
    styleUrls: ['./base-field.component.scss'],
})
export class BaseFieldComponent implements OnInit, AfterViewInit {
    public value: any;

    public errorMessages: string[];

    @Input()
    public formMetaField: FormMetaField;

    @Input()
    public fieldCollectionService: FieldCollectionService;

    @Input()
    public formMode: FormMode;

    @Input()
    public recordItemSlug: string;

    @Input()
    public isHidden = false;

    public inBuildMode: boolean;

    public extraData: {} = {};

    private waitForLoading = false;

    ngOnInit() {
        this.fieldCollectionService.add(this);
        this.inBuildMode = this.formMode === FormMode.Build;
        if (!this.waitForLoading) {
            // we dont need to wait, so immediately shoot onLoadFinished
            setTimeout((_) => this.fieldCollectionService.onLoadFinished(this), 1);
        }
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setValue(this.formMetaField.Value);
        }, 0);
    }

    getValue(): any {
        return this.value;
    }

    setValue(value: any) {
        this.value = value;
    }

    public clear() {
        this.setValue('');
    }

    getSlug(): string {
        return this.formMetaField.Slug;
    }

    validate(): void {
        this.clearErrorMessages();
        const value = this.getValue();

        if (
            this.formMetaField.required &&
            (value === null || value === 'null' || value === undefined || value === '')
        ) {
            this.addErrorMessage('This field is required');
        }
    }

    getErrorMessages(): string[] {
        return this.errorMessages;
    }

    addErrorMessage(errorMessage: string) {
        this.errorMessages.push(errorMessage);
    }

    clearErrorMessages() {
        this.errorMessages = [];
    }

    setDefaultValue() {
        const defaultValue = this.formMetaField.getSettingValue(FieldSettings.DefaultValue);
        if (defaultValue != null) {
            this.setValue(defaultValue);
        }
    }

    protected splitStringAndRemoveSpacesInArray(value: string) {
        if (value == null || value.trim() === '') {
            return [];
        }

        const stringArray = value.split(',');
        stringArray.forEach((el, index) => (stringArray[index] = el.trim()));
        return stringArray;
    }

    protected doWaitForLoading() {
        this.waitForLoading = true;
    }
}
