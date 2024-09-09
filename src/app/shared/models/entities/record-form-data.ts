import { Folder } from './folder';
import { FormData } from './form-data';
import { Group } from './group';

export class RecordFormData extends FormData {
    Title: string;
    Slug: string;
    Active: number;
    ShowInMenu: number;
    MenuID: number;
    MenuParentSlug: string;
    AllowUpload: number;
    TapedForm: number;
    Folder: Folder;
    Groups: any[];
    Versions: any[];
    OpenFormInDialog: number;
    userCanCreateFile: boolean;
    userCanEditFile: boolean;
    userCanDeleteFile: boolean;
    userCanViewFile: boolean;
    RecordItems: SubRecordItemInfo[];

    ActiveBool: boolean;
    ShowInMenuBool: boolean;
    TapedFormBool: boolean;
    AllowUploadBool: boolean;
    OpenFormInDialogBool: boolean;

    public handleBoolAfterLoad() {
        this.ActiveBool = this.numberToBoolean(this.Active);
        this.ShowInMenuBool = this.numberToBoolean(this.ShowInMenu);
        this.TapedFormBool = this.numberToBoolean(this.TapedForm);
        this.AllowUploadBool = this.numberToBoolean(this.AllowUpload);
        this.OpenFormInDialogBool = this.numberToBoolean(this.OpenFormInDialog);
    }

    public handleBoolBeforeSave() {
        this.Active = this.boolToNumber(this.ActiveBool);
        this.ShowInMenu = this.boolToNumber(this.ShowInMenuBool);
        this.TapedForm = this.boolToNumber(this.TapedFormBool);
        this.AllowUpload = this.boolToNumber(this.AllowUploadBool);
        this.OpenFormInDialog = this.boolToNumber(this.OpenFormInDialogBool);
    }

    private numberToBoolean(val: number): boolean {
        return (val === 1) ? true : false;
    }

    private boolToNumber(val: boolean): number {
        return (val) ? 1 : 0;
    }
}

export class SubRecordItemInfo {
    RecordSetItemSlug: string;
    Record: {
        Slug: string;
        Title: string;
    };
}
