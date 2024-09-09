export class FileData {
    CanEditType: string;
    CanViewType: string;
    ClassName: string;
    Created: Date;
    CreatedBy: string;
    EditorGroupSlugs: string[] = [];
    Filename: string;
    IconCls: string;
    LastEdited: Date;
    Link: string;
    Name: string;
    NextFileSlug: string;
    Notes: string;
    Permissions: any;
    PrevFileSlug: string;
    Slug: string;
    ThumbnailURL: string;
    Title: string;
    UpdatedBy: string;
    Version: number;
    Versions: any[];
    ViewerGroupSlugs: string[] = [];
    ViewerLink: string;
}
