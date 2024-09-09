import { SelectItem } from 'primeng/api';
import { FieldSettingNames } from './field-setting-names';
import { FieldSettingConverter } from './field-setting-converter';
import { FieldSettingEditType } from './field-setting-edit-type';
import { FieldSettingOptionsConverter } from './field-setting-options-converter';
import { TextType } from '../text-type';
import { FieldSettingValues } from './field-setting-values';
import { FieldSettingConditions } from './field-setting-conditions';
import { SettingsService } from 'src/app/shared/services/settings.service';

export  class FieldSetting {
  name: string;
  type: FieldSettingEditType;
  label: string;
  maxLength?: number;
  placeholder?: string;
  value?: string | boolean | string[];
  showForTextTypes?: TextType[]; // show this setting-field only if the field definition has one of the TextTypes in this array
  options?: SelectItem[];
  converter ?: FieldSettingConverter;
  dropdownMultiple?: boolean;
  conditions: FieldSettingConditions;
  disabledConditions: FieldSettingConditions;
  getValuesFromSetting = false;
  settingName?: string;
  settingsService: SettingsService;
  hint?: string;

  public constructor(
                fieldSetting: FieldSetting) {
    Object.keys(fieldSetting).forEach(k => {
      this[k] = fieldSetting[k];
    });
    return this;
  }
}

export const FieldSettings = {
  Label: {
    name: FieldSettingNames.Label,
    label: 'label',
    type: FieldSettingEditType.Text
  } as FieldSetting,

  Placeholder: {
    name: FieldSettingNames.Placeholder,
    label: 'placeholder',
    type: FieldSettingEditType.Text
  } as FieldSetting,

  Info: {
    name: FieldSettingNames.Info,
    label: 'field-info',
    type: FieldSettingEditType.Text,
    maxLength: 100
  } as FieldSetting,

  DefaultValue: {
    name: FieldSettingNames.DefaultValue,
    label: 'default-value',
    type: FieldSettingEditType.Text
  } as FieldSetting,

  ReadOnly: {
    name: FieldSettingNames.ReadOnly,
    label: 'read-only',
    type: FieldSettingEditType.Checkbox
  } as FieldSetting,

  Active: {
    name: FieldSettingNames.IsActive,
    label: 'active',
    type: FieldSettingEditType.Checkbox
  } as FieldSetting,

  Hidden: {
    name: FieldSettingNames.IsHidden,
    label: 'hidden',
    type: FieldSettingEditType.Checkbox
  } as FieldSetting,

  ShowInResultList: {
    name: FieldSettingNames.ResultList,
    label: 'show-in-resultlist',
    type:  FieldSettingEditType.Checkbox
  } as FieldSetting,

  ShowInItemView: {
    name: FieldSettingNames.ShowInItemView,
    label: 'show-in-item-view',
    type: FieldSettingEditType.Checkbox
  } as FieldSetting,

  Required: {
    name: FieldSettingNames.IsRequired,
    label: 'required',
    type:  FieldSettingEditType.Checkbox
  } as FieldSetting,

  Options: {
    name: FieldSettingNames.Options,
    label: 'options',
    type:  FieldSettingEditType.Text,
    placeholder: 'Options separated by comma, e.g. Red,Green,Blue',
    converter: new FieldSettingOptionsConverter()
  } as FieldSetting,

  MultipleSelect: {
    name: FieldSettingNames.IsMultipleSelect,
    label: 'multiple',
    type:  FieldSettingEditType.Checkbox
  } as FieldSetting,

  TextType: {
    name: FieldSettingNames.TextType,
    label: 'Type',
    type:  FieldSettingEditType.Dropdown,
    options: [
      { value: TextType.Text, label: 'Text' },
      { value: TextType.Email, label: 'E-mail' },
      { value: TextType.Number, label: 'Number' },
      { value: TextType.Telephone, label: 'Phone' },
      { value: TextType.Password, label: 'Password' },
      { value: TextType.Date, label: 'Date' },
      { value: TextType.Time, label: 'Time' },
      { value: TextType.DateTime, label: 'Datetime' },
      { value: TextType.Money, label: 'Money' },
      { value: TextType.Unit, label: 'Unit' }
    ]
  } as FieldSetting,

  Maxlength: {
    name: FieldSettingNames.MaxLength,
    label: 'Maxlength',
    type:  FieldSettingEditType.Number,
    showForTextTypes: [TextType.Text]
  } as FieldSetting,

  NumberType: {
    name: FieldSettingNames.NumberType,
    label: 'Number Type',
    type:  FieldSettingEditType.Dropdown,
    showForTextTypes: [TextType.Number],
    options: [
      { value: 'integer', label: 'Integer' },
      { value: 'decimal', label: 'Decimal' },
      { value: 'percent', label: 'Percent' }
    ]
  } as FieldSetting,

  DateFormat: {
    name: FieldSettingNames.DateFormat,
    label: 'date-format',
    type:  FieldSettingEditType.Text,
    showForTextTypes: [TextType.Date, TextType.DateTime],
    placeholder: 'e.g. d.m.Y'
  } as FieldSetting,

  HourFormat: {
    name: FieldSettingNames.HourFormat,
    label: 'hour-format',
    type: FieldSettingEditType.Dropdown,
    showForTextTypes: [TextType.DateTime, TextType.Time],
    options: [
      { value: '24', label: '24'},
      { value: '12', label: '12'}
    ]
  } as FieldSetting,

  ShowSeconds: {
    name: FieldSettingNames.ShowSeconds,
    label: 'show-seconds',
    type: FieldSettingEditType.Checkbox,
    showForTextTypes: [TextType.DateTime, TextType.Time]
  } as FieldSetting,

  MoneyType: {
    name: FieldSettingNames.Currency,
    label: 'Currency',
    type:  FieldSettingEditType.Dropdown,
    showForTextTypes:  [TextType.Money],
    options: [
      { value: 'euro', label: 'EUR' },
      { value: 'usd', label: 'USD' },
      { value: 'yen', label: 'YEN' }
    ],
    getValuesFromSetting: true,
    settingName: 'formbuilder_currency'
  } as FieldSetting,

  UnitType: {
    name: FieldSettingNames.UnitType,
    label: 'Unit type',
    type:  FieldSettingEditType.Dropdown,
    showForTextTypes:  [TextType.Unit],
    options: [
    ],
    getValuesFromSetting: true,
    settingName: 'formbuilder_unit'
  } as FieldSetting,

  Summable: {
    name: FieldSettingNames.Summable,
    label: 'Summable',
    type: FieldSettingEditType.Checkbox,
    showForTextTypes: [TextType.Number, TextType.Money, TextType.Unit],
    hint: 'summable-field-hint'
  } as FieldSetting,

  SummablePrefix: {
    name: FieldSettingNames.SummablePrefix,
    label: 'Summable-Prefix',
    type: FieldSettingEditType.Text,
    showForTextTypes: [TextType.Number, TextType.Money, TextType.Unit]
  } as FieldSetting,

  SummableSuffix: {
    name: FieldSettingNames.SummableSuffix,
    label: 'Summable-Suffix',
    type: FieldSettingEditType.Text,
    showForTextTypes: [TextType.Number, TextType.Money, TextType.Unit]
  } as FieldSetting,

  UploadMaxSize: {
    name: FieldSettingNames.UploadMaxSize,
    label: 'Upload Max Size',
    type:  FieldSettingEditType.Text
  } as FieldSetting,
  
  UploadMaxFile: {
    name: FieldSettingNames.UploadMaxFile,
    label: 'Upload Max File Number',
    type:  FieldSettingEditType.Text
  } as FieldSetting,
  UploadAccepts: {
    name: FieldSettingNames.AcceptFileTypes,
    label: 'File Types',
    type:  FieldSettingEditType.Dropdown,
    dropdownMultiple: true,
    options: [
      { label: 'JPG', value: '.jpg' },
      { label: 'JPEG', value: '.jpeg' },
      { label: 'PNG', value: '.png' },
      { label: 'CSV', value: '.csv' },
      { label: 'XLXS', value: '.xlxs' },
      { label: 'TXT', value: '.txt' },
      { label: 'MP4', value: '.mp4' },
      { label: 'MOV', value: '.mov' },
      { label: 'PDF', value: '.pdf' },
    ]
  } as FieldSetting,

  UploadName: {
    name: FieldSettingNames.UploadName,
    label: 'Name',
    type:  FieldSettingEditType.Text
  } as FieldSetting,

  RelationData: {
    name: FieldSettingNames.RelationData,
    label: 'relation-data',
    type: FieldSettingEditType.RadioButtons,
    options: [
      { label: 'Records / Databases', value: FieldSettingValues.Record },
      { label: 'Models / Plugins', value: FieldSettingValues.Model }
    ]
  } as FieldSetting,

  RelationType: {
    name: FieldSettingNames.RelationType,
    label: 'relation-type',
    type: FieldSettingEditType.RadioButtons,
    options: [
      { label: 'has-one', value: FieldSettingValues.HasOne },
      { label: 'has-many', value: FieldSettingValues.HasMany },
      { label: 'has-one-field-mapping', value: FieldSettingValues.FieldMapping }
    ]
  } as FieldSetting,

  RecordSelect: {
    name: FieldSettingNames.Record,
    label: 'record',
    type: FieldSettingEditType.RecordSelect
  } as FieldSetting,

  ModelSelect: {
    name: FieldSettingNames.Model,
    label: 'model',
    type: FieldSettingEditType.ModelSelect
  } as FieldSetting,

  DisplayFields: {
    name: FieldSettingNames.DisplayFields,
    label: 'display-fields',
    type: FieldSettingEditType.DisplayFields
  } as FieldSetting,

  FieldMapping: {
    name: FieldSettingNames.FieldMapping,
    label: 'field-mapping',
    type: FieldSettingEditType.FieldMapping
  } as FieldSetting
};




