export class RecordFormInfo {
    Slug: string;
    Fields: RecordFormField[];
}

export class RecordFormField {
    Slug: string;
    Active: boolean;
    Label: string;
    ShowInResultlist: boolean;
}
 