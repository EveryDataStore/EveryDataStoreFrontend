
import { Group } from './group';
import { FormSection } from './form-section';
import { Folder } from './folder';
import { FormMetaField } from './form-meta-field';
import { RecordFormData } from './record-form-data';
import { ItemData } from './item-data';

export class CustomRecordFormData {
    Record: RecordFormData;

    constructor() {
        this.Record = new RecordFormData();
        this.Record.Title = '';
        this.Record.Slug = '';
        this.Record.Active = 1;
        this.Record.ShowInMenu = 0;
        this.Record.MenuID = null;
        this.Record.MenuParentSlug = null;
        this.Record.AllowUpload = 0;
        this.Record.TapedForm = 0;
        this.Record.Folder = null;
        this.Record.Sections = [];
        this.Record.Groups = [];
        this.Record.Versions = [];
        this.Record.userCanCreateFile = false;
        this.Record.userCanEditFile = false;
        this.Record.userCanDeleteFile = false;
        this.Record.userCanViewFile = false;
        this.Record.RecordItems = [];
    }

    public prepareForPost(): CustomRecordFormData {
        this.Record.handleBoolBeforeSave();
        // update order indexes
        this.Record.prepareForPost();
        return this;
    }

    public processAfterLoad() {
        this.Record.handleBoolAfterLoad();
    }

    public getFormMetaFields(): FormMetaField[] {
        return this.Record.getFormMetaFields();
    }

    public getFormMetaFieldBySlug(slug: string) {
        return this.getFormMetaFields().find(f => f.Slug === slug);
    }
}
