import { FormColumn } from './form-column';

export class FormSection {
    Title: string;
    Slug: string;
    Index: number;
    Columns: FormColumn[];

    constructor() {
        this.Columns = [];
    }
}
