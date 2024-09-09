import { FieldSetting } from './field-setting';

export class FieldSettingConditions {

    private eqConditions: [FieldSetting, string][] = [];
    private neqConditions: [FieldSetting, string][] = [];

    constructor() {
        return this;
    }

    public eq(fieldSetting: FieldSetting, value: string) {
        this.eqConditions.push([fieldSetting, value]);
        return this;
    }

    public neq(fieldSetting: FieldSetting, value: string) {
        this.neqConditions.push([fieldSetting, value]);
        return this;
    }

    public check(fieldSettings: FieldSetting[]): boolean {
        let conditionsFit = false;
        this.eqConditions.forEach(condition => {
            const field = fieldSettings.find(ef => ef === condition[0]);
            if (field && field.value === condition[1]) {
                conditionsFit = true;
            }
        });

        if (this.neqConditions.length > 0) {
            conditionsFit = true;
            this.neqConditions.forEach(condition => {
                const field = fieldSettings.find(ef => ef === condition[0]);
                if (field && field.value === condition[1]) {
                    conditionsFit = false;
                }
            });
        }

        return conditionsFit;
    }
}
