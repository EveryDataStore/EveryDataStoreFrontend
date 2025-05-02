import {FieldSettingConditions} from '../field-settings/field-setting-conditions';
import {FormMetaField} from '../entities/form-meta-field';
import {FieldSetting, FieldSettings} from '../field-settings/field-setting';
import {FieldSettingValues} from '../field-settings/field-setting-values';
import {FieldType} from '../field-type';

export class RelationField extends FormMetaField {
    constructor() {
        super();
        this.Type = FieldType.RelationField;

        const recordSelect = new FieldSetting(FieldSettings.RecordSelect);
        const modelSelect = new FieldSetting(FieldSettings.ModelSelect);
        const displayFields = new FieldSetting(FieldSettings.DisplayFields);
        const fieldMapping = new FieldSetting(FieldSettings.FieldMapping);
        const showInResultList = new FieldSetting(FieldSettings.ShowInResultList);
        const required = new FieldSetting(FieldSettings.Required);
        this.setFieldSettingEdits([
            FieldSettings.Label,
            FieldSettings.Info,
            FieldSettings.Active,
            required,
            showInResultList,
            FieldSettings.ShowInItemView,
            FieldSettings.ShowInSearchFilter,
            FieldSettings.RelationData,
            FieldSettings.RelationType,
            recordSelect,
            modelSelect,
            displayFields,
            fieldMapping,
        ]);
        recordSelect.conditions = new FieldSettingConditions().eq(
            FieldSettings.RelationData,
            FieldSettingValues.Record
        );
        modelSelect.conditions = new FieldSettingConditions().eq(FieldSettings.RelationData, FieldSettingValues.Model);
        fieldMapping.conditions = new FieldSettingConditions().eq(
            FieldSettings.RelationType,
            FieldSettingValues.FieldMapping
        );
        showInResultList.disabledConditions = new FieldSettingConditions().neq(
            FieldSettings.RelationType,
            FieldSettingValues.HasOne
        );
        required.disabledConditions = new FieldSettingConditions().eq(
            FieldSettings.RelationType,
            FieldSettingValues.FieldMapping
        );
    }
}
