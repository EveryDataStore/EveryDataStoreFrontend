import { FormSection } from './form-section';
import { FormMetaField } from './form-meta-field';
import { FormMetaFieldFactory } from './form-meta-field-factory';

export class FormData {
    Sections: FormSection[];
    Reorderable: number = 0;
    public prepareForPost(): FormData {
        // update order indexes
        this.Sections.forEach((section, sectionIndex) => {
            section.Index = sectionIndex + 1;
            section.Columns.forEach((column, columnIndex) => {
                column.Index = columnIndex + 1;
                column.Fields.forEach((field, fieldIndex) => {
                  field.Index = fieldIndex + 1;
                });
            });
        });
        return this;
    }

    public getFormMetaFields(): FormMetaField[] {
        const result: FormMetaField[] = [];
        this.Sections.forEach( section => {
            section.Columns.forEach(column => {
                column.Fields.forEach(field => {
                  result.push(field);
                });
            });
        });
        return result;
    }
}
