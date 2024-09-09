export interface FieldSettingConverter {
    fromValueToString(value: any): string;
    fromStringToValue(text: string): any;
}
