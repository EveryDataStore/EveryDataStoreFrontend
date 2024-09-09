import { FieldSettingNames } from './../field-settings/field-setting-names';
import { ServicesProviderService } from './../../services/services-provider.service';
import { FieldSetting, FieldSettings } from '../field-settings/field-setting';
import { FieldSettingEditType } from '../field-settings/field-setting-edit-type';
import { FieldSettingValues } from '../field-settings/field-setting-values';
import { FieldType } from '../field-type';
import { TextType } from '../text-type';
import { FieldSettingKeyValue} from './field-setting-key-value';
import { isObject } from '../../libs/typechecks';

export class FormMetaField {

   Slug: string;
   Type: FieldType;
   Index: number;
   Name: string;
   Setting: FieldSettingKeyValue[] = [];
   Value: any;

   autoOpen = false;

   private fieldSettingEdits: FieldSetting[] = [];
   private servicesProviderService: ServicesProviderService;

   constructor() {
   }

   /**
    * Serialize method
    */
   public toJSON() {
      // put in here all fields that should not be converted to json
      const { fieldSettingEdits, servicesProviderService: servicesProvider, ...rest } = this;
      return rest;
   }

   public setServicesProviderService(servicesProviderService: ServicesProviderService) {
      this.servicesProviderService = servicesProviderService;
   }

   public getTranslateService() {
      return this.servicesProviderService.getTranslateService();
   }

   public afterSetup() {
   }

   get label(): string {
      return this.getSettingValue(FieldSettings.Label);
   }

   set label(value: string) {
      this.setSettingValue(FieldSettings.Label, value);
   }

   get type(): FieldType {
      return this.Type;
   }

   set type(type: FieldType) {
      this.Type = type;
   }

   get slug(): string {
      return this.Slug;
   }

   get name(): string {
      return this.Name;
   }

   get placeholder(): string {
      return this.getSettingValue(FieldSettings.Placeholder);
   }

   get info(): string {
      return this.getSettingValue(FieldSettings.Info);
   }

   get uploadMaxSize(): string {
      return this.getSettingValue(FieldSettings.UploadMaxSize);
   }

   get uploadMultiple(): string {
      return this.getSettingValue(FieldSettings.MultipleSelect);
   }

   get uploadMaxFile(): string{
        return this.getSettingValue(FieldSettings.UploadMaxFile);
    }

   get uploadAccepts(): string {
      return this.getSettingValue(FieldSettings.UploadAccepts);
   }

   get uploadName(): string {
      return this.getSettingValue(FieldSettings.UploadName);
   }

   get required(): boolean {
      return this.settingToBoolean(FieldSettings.Required);
   }

   get active(): boolean {
      return this.settingToBoolean(FieldSettings.Active);
   }

   get hidden(): boolean {
      return this.settingToBoolean(FieldSettings.Hidden);
   }

   get dateFormat(): string {
      return this.getSettingValue(FieldSettings.DateFormat);
   }

   get hourFormat(): string {
      return this.getSettingValue(FieldSettings.HourFormat);
   }

   get showSeconds(): boolean {
      return this.getSettingValueAsBoolean(FieldSettings.ShowSeconds);
   }

   get textType(): TextType {
      return this.getSettingValue(FieldSettings.TextType);
   }

   get maxLength(): string {
     let maxL: string;
     if (this.Type === FieldType.TextField && FieldSettings.Maxlength.showForTextTypes) {
       if (FieldSettings.Maxlength.showForTextTypes.find(fs => fs === this.textType)) {
         maxL = this.getSettingValue(FieldSettings.Maxlength);
       }
     }
     return maxL;
   }

   get value(): any {
      return (this.Value != null) ? this.Value : this.getSettingValue(FieldSettings.DefaultValue);
   }

   public getFieldSettingEdits() {
      this.fieldSettingEdits.forEach((fieldSettingEdit, index) => {

         if (fieldSettingEdit.type === FieldSettingEditType.Checkbox) {
            fieldSettingEdit.value = this.getSettingValueAsBoolean(fieldSettingEdit);
         } else {
            const value = this.getSettingValue(fieldSettingEdit);
            if (fieldSettingEdit.converter !== undefined) {
               fieldSettingEdit.value = fieldSettingEdit.converter.fromValueToString(value);
            } else {
               fieldSettingEdit.value = value;
            }
         }

         if ((fieldSettingEdit.name === FieldSettingNames.TextType) && (!fieldSettingEdit.value)) {
           fieldSettingEdit.value = TextType.Text;
         }

         if ((fieldSettingEdit.getValuesFromSetting) && (fieldSettingEdit.settingName)) {
            const options = this.servicesProviderService.getSettingsService().getAsJson(fieldSettingEdit.settingName);
            if (options && (Object.keys(options).length > 0)) {
               fieldSettingEdit.options = options;
            }
         }
      });
      return this.fieldSettingEdits;
   }

   public getFieldSettingOptions(fieldSetting: FieldSetting) {
      const fieldSettingEdit = this.getFieldSettingEdits().find(fe => fe === fieldSetting);
      if (fieldSettingEdit) {
         return fieldSettingEdit.options;
      }
      return [];
   }

   public getSelectedFieldSettingOption(fieldSetting: FieldSetting) {
      const options = this.getFieldSettingOptions(fieldSetting);
      const value = this.getSettingValue(fieldSetting);
      const option = options.find(o => o.value === value);
      return option;
   }

   public getSelectedFieldSettingOptionLabel(fieldSetting: FieldSetting) {
      const option = this.getSelectedFieldSettingOption(fieldSetting);
      const value = this.getSettingValue(fieldSetting);
      if (option) {
         if (option['symbol']) {
            return option['symbol'];
         }
         return option.label;
      }
      return value;
   }

   public setFieldSettingEdits(fieldSettingEdits: FieldSetting[]) {
      this.fieldSettingEdits = fieldSettingEdits;
   }

   public getUnit() {
      let unit = null;
      if (this.getSettingValue(FieldSettings.TextType) === TextType.Unit) {
        unit = this.getSelectedFieldSettingOptionLabel(FieldSettings.UnitType);
      }

      if (this.getSettingValue(FieldSettings.TextType) === TextType.Money) {
        unit = this.getSelectedFieldSettingOptionLabel(FieldSettings.MoneyType);
      }

      if (this.getSettingValue(FieldSettings.NumberType) === 'percent') {
         unit = '%';
      }

      return unit;
   }

   public getSettingValue(fieldSetting: FieldSetting): any {
      const setting = this.getSetting(fieldSetting);
      return (setting != null) ? setting.value : null;
   }

   public getSettingValueAsString(fieldSetting: FieldSetting): string {
      const setting = this.getSetting(fieldSetting);
      return (setting != null) ? setting.value : '';
   }

   public getSettingValueAsBoolean(fieldSetting: FieldSetting): boolean {
      const settingString = this.getSettingValue(fieldSetting);
      return settingString === 'true';
   }

   public getSetting(fieldSetting: FieldSetting): FieldSettingKeyValue {
      if (this.Setting !== undefined) {
         const setting: FieldSettingKeyValue = this.Setting.filter(s => s.title === fieldSetting.name).shift();
         if (setting !== undefined) {
            return setting;
         }
      }
      return null;
   }

   public setSettingValue(fieldSetting: FieldSetting, value) {

      /*if (settingName === 'value') {
         this.Value = value;
         return;
      }*/

      if (this.Setting === undefined) {
         this.Setting = [];
      }
      if (typeof value === 'boolean') {
         value = (value) ? 'true' : 'false';
      }

      const setting  = this.getSetting(fieldSetting);
      if (setting == null) {
         this.Setting.push(new FieldSettingKeyValue(fieldSetting.name, value));
      } else {
         setting.value = value;
      }
   }

   public isDateOrTimeTextType(): boolean {
      if (this.Type === FieldType.TextField) {
         return (
            [TextType.Date, TextType.DateTime, TextType.Time]
            .indexOf(this.textType) >= 0);
      }
      return false;
   }

   public isDateTextType(): boolean {
      return (this.textType === TextType.Date);
   }

   public isTimeTextType(): boolean {
      return (this.textType === TextType.Time);
   }

   public isDateTimeTextType(): boolean {
      return (this.textType === TextType.DateTime);
   }

   public isRelationFieldMappingField(): boolean {
      if (this.Type === FieldType.RelationField) {
         if (this.getSettingValue(FieldSettings.RelationType) === FieldSettingValues.FieldMapping) {
            return true;
         }
      }
      return false;
   }

   public isRelationHasManyField(): boolean {
      if (this.Type === FieldType.RelationField) {
         if (this.getSettingValue(FieldSettings.RelationType) === FieldSettingValues.HasMany) {
            return true;
         }
      }
      return false;
   }

   public formatValueForViewing(rawValue: any): string {

      if (rawValue === '') { return rawValue; }

      // TextField - check for special cases
      if (this.Type === FieldType.TextField.toString()) {
         /*if (this.isDateOrTimeTextType()) {
            if (this.isDateTextType()) {
               return new Date(rawValue).toLocaleDateString();
            }
            if (this.isTimeTextType() && (rawValue) && (rawValue.length > 8)) {
               return new Date(rawValue).toLocaleTimeString();
            }
            if (this.isDateTimeTextType()) {
               const date = new Date(rawValue);
               return  date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
            }
         }*/
      }

      // UploadField
      if (this.Type === FieldType.UploadField.toString()) {
         return rawValue;
      }

      // any object value
      if (isObject(rawValue)) {
         let value = '';
         Object.keys(rawValue).forEach((key, index) => {
            value += rawValue[key];
            if (index < Object.keys(rawValue).length - 1) {
               value += ', ';
            }
         });
         return value;
      }

      return rawValue;
   }

   private settingToBoolean(fieldSetting: FieldSetting) {
      const value = this.getSettingValue(fieldSetting);
      return (value === 'true');
   }
}
