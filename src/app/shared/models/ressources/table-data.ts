import {RecordFormData} from 'src/app/shared/models/entities/record-form-data';
import {ApiService} from './../../services/api.service';
import {RecordItemData} from './../entities/record-item-data';
import {FormMetaField} from '../entities/form-meta-field';
import {FieldSettings} from '../field-settings/field-setting';
import {ItemData} from '../entities/item-data';
import {CustomRecordFormData} from '../entities/custom-record-form-data';

export enum ItemsType {
    Record,
    Model,
}

export interface DataRow {
    itemSlug: string;
    data: {};
}

export interface DataCol {
    label: string;
    fieldSlug: string;
    fieldType: string;
    fieldTextType: string;
}

export class TableData {
    cols: DataCol[] = [];
    rows: DataRow[] = [];
    fields: FormMetaField[] = [];
    totalItemsCount: number;
    searchTerm = '';
    itemsPerPage: number;

    private datasetType: ItemsType;
    private datasetId: string;
    private datasetTitle: string;

    private recordFormData: CustomRecordFormData;
    private colsInfoLoaded = false;

    public constructor(private apiService: ApiService) {
        return this;
    }

    public getDatasetId() {
        return this.datasetId;
    }

    public clear() {
        this.cols = [];
        this.rows = [];
        this.fields = [];
        this.colsInfoLoaded = false;
    }

    public async initParameter(itemsType: ItemsType, datasetId: string, itemsPerPage: number) {
        this.clear();
        this.datasetType = itemsType;
        this.datasetId = datasetId;
        this.itemsPerPage = itemsPerPage;
        this.totalItemsCount = await this.getItemsCount(itemsType, datasetId);
    }

    public async loadItems(page: number) {
        if (this.datasetType === ItemsType.Model) {
            await this.loadModelItemsPaged(this.datasetId, page, this.itemsPerPage);
        }
        if (this.datasetType === ItemsType.Record) {
            await this.loadRecordItemsPaged(this.datasetId, page, this.itemsPerPage);
        }
    }

    public async setSearchTerm(searchTerm: string) {
        this.searchTerm = searchTerm;
        await this.loadItems(1);
    }

    // --- Record ---

    public async loadRecordItemsPaged(
        recordSlug: string,
        page: number,
        itemsPerPage: number,
        sortColumn = '',
        sortOrder = 1
    ) {
        await this.setupRecordCols(recordSlug);

        const recordItems = await this.apiService.getRecordItems({
            recordSlug,
            page,
            count: itemsPerPage,
            sortColumn,
            sortOrder,
            searchTerm: this.searchTerm,
        });
        this.datasetTitle = this.recordFormData.Record.Title;
        this.fillRowsFromRecordItems(recordItems.Items);

        return this;
    }

    public async loadRecordItems(recordSlug: string, recordItemSlugs: string[] = []) {
        await this.setupRecordCols(recordSlug);

        const recordItems = await this.apiService.getRecordItemsFromList(recordSlug, recordItemSlugs);
        this.datasetTitle = this.recordFormData.Record.Title;
        this.fillRowsFromRecordItems(recordItems);

        return this;
    }

    public async setupRecordCols(recordSlug: string) {
        if (!this.colsInfoLoaded) {
            this.colsInfoLoaded = true;
            this.recordFormData = await this.apiService.getRecordFormData(recordSlug);
            this.fillColsFromFormMetaFields(this.recordFormData.getFormMetaFields());
        }
    }

    public fillRowsFromRecordItems(recordItems: RecordItemData[]) {
        if (!recordItems) {
            return;
        }

        this.rows = [];
        if (recordItems.length <= 0) {
            return;
        }

        recordItems.forEach((rid: RecordItemData) => {
            const rowData = {};
            rid.ItemData.forEach((itemData) => {
                if (itemData.FormFieldSlug !== null) {
                    if (!rowData[itemData.FormFieldSlug]) {
                        rowData[itemData.FormFieldSlug] = this.getFormattedValueFromItemData(itemData);
                    }
                }
            });
            this.rows.push({itemSlug: rid.Slug, data: rowData});
        });
    }

    // --- Model ---

    public async loadModelItemsPaged(
        modelName: string,
        page: number,
        itemsPerPage: number,
        sortColumn = '',
        sortOrder = 1
    ) {
        await this.setupModelCols(modelName);

        const modelItems = await this.apiService.getModelItems(
            modelName,
            page,
            itemsPerPage,
            sortColumn,
            sortOrder,
            this.searchTerm
        );

        this.datasetTitle = modelName;
        this.fillRowsFromModelItems(modelItems);

        return this;
    }

    public async loadModelItems(modelName: string, modelItemSlugs: string[] = []) {
        await this.setupModelCols(modelName);
        const modelItems = await this.apiService.getModelItemsFromList(modelName, modelItemSlugs);
        this.datasetTitle = modelName;

        this.fillRowsFromModelItems(modelItems);
        return this;
    }

    public fillRowsFromModelItems(modelItems: []) {
        this.rows = [];
        if (modelItems.length <= 0) {
            return;
        }

        modelItems.forEach((modelItem) => {
            const rowData = {};
            Object.keys(this.fields).forEach((fieldName) => {
                const field = this.fields[fieldName];
                rowData[fieldName] = field.formatValueForViewing(modelItem[fieldName]);
            });

            this.rows.push({itemSlug: modelItem['Slug'], data: rowData});
        });
    }

    public fillColsFromFormMetaFields(formMetaFields: FormMetaField[]) {
        this.cols = [];
        formMetaFields.forEach((field) => {
            if (
                field.getSettingValueAsBoolean(FieldSettings.ShowInResultList) &&
                field.getSettingValueAsBoolean(FieldSettings.Active)
            ) {
                this.cols.push({
                    label: field.label,
                    fieldSlug: field.Slug,
                    fieldType: field.Type,
                    fieldTextType: field.textType,
                });
                this.fields[field.Slug] = field;
            }
        });
    }

    public fillColsFromModelColsAndFormMetaFields(columns: {}, formMetaFields: FormMetaField[]) {
        Object.keys(columns).forEach((fieldName) => {
            const field = formMetaFields.find((f) => f.Name === fieldName);
            if (field) {
                this.cols.push({
                    label: columns[fieldName],
                    fieldSlug: fieldName,
                    fieldType: field.Type,
                    fieldTextType: field.textType,
                });
                this.fields[fieldName] = field;
            }
        });
    }

    public getDatasetTitle() {
        return this.datasetTitle;
    }

    private async setupModelCols(modelName: string) {
        if (!this.colsInfoLoaded) {
            this.colsInfoLoaded = true;
            const columns = await this.apiService.getModelSummaryFields(modelName);
            const formFields = await this.apiService.getFormFieldsForModel(modelName);
            this.fillColsFromModelColsAndFormMetaFields(columns, formFields.getFormMetaFields());
        }
    }

    private getFormattedValueFromItemData(itemData: ItemData) {
        const field: FormMetaField = this.fields[itemData.FormFieldSlug];
        if (field === undefined) {
            return '';
        }

        return field.formatValueForViewing(itemData.Value);
    }

    private async getItemsCount(datasetType: ItemsType, datasetId: string) {
        if (datasetType === ItemsType.Record) {
            return await this.apiService.getRecordItemsCount(datasetId);
        }
        if (datasetType === ItemsType.Model) {
            return await this.apiService.getModelItemsCount(datasetId);
        }
    }
}
