import { RecordItemData } from 'src/app/shared/models/entities/record-item-data';
import { ItemData } from './item-data';
import { Record } from './record';
import { RecordFormData } from './record-form-data';

export class RecordItems {
    CountItems: number;
    Items: RecordItemData[];
    Record: RecordFormData;
    SummableItems: SummableItem[];
}

export class SummableItem {
    label: string;
    niceSum: string;
    slug: string;
    sum: string;
}


