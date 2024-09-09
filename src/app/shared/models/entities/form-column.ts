import { SlugService } from '../../services/slug.service';
import { FormMetaField } from './form-meta-field';

export class FormColumn {
    Slug: string;
    Index: number;
    Fields: FormMetaField[] = [];

    constructor() {
        this.Index = 1;
        this.Fields = [];
    }
}
