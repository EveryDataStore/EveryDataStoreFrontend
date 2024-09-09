import { FieldSettingConverter } from './field-setting-converter';

export class FieldSettingOptionsConverter implements FieldSettingConverter {

    fromValueToString(value: any|string): string {
        if (typeof value === 'string') { return value as string; }
        if ((value === undefined) || (value === null)) { return ''; }

        let text = '';
        Object.keys(value as object).forEach((key, index) => {
            text += value[key];
            if (index < Object.keys(value).length - 1) { text += ', '; }
        });
        return text;
    }

    fromStringToValue(text: string): any {
        const result = {};
        if (text == null || text.trim() === '') {
            return [];
          }
        const stringArray = text.split(',');
        stringArray.forEach((el, index) => result[el.trim()] = el.trim());
        return result;
    }
}
