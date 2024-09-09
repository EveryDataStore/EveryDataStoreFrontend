export class RecordItem {
    RecordSlug: string;
    Fields: RecordItemFieldValue[] = [];
    IsAutoSave = false;
    RecordItems: {
        Slug: string;
        Fields: RecordItemFieldValue[];
    }[] = [];
}

/*export class RecordItemFields {
    RecordItemSlug: string;
    FieldValues: RecordItemFieldValue[] = [];
}*/

export class RecordItemFieldValue {
    Slug: string;
    Value: any;
}
