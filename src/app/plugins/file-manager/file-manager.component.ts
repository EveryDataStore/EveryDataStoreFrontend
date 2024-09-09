import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {NextConfig} from './app-config';
import {MenuItem, TreeNode} from 'primeng/api';
import {Dialog} from 'primeng/dialog';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Table} from 'primeng/table';
import {ApiService} from '../../shared/services/api.service';
import {SettingsService} from 'src/app/shared/services/settings.service';
import {ActivatedRoute} from '@angular/router';
import * as $ from 'jquery';
import {FileData} from 'src/app/shared/models/entities/file-data';
import {formatDate} from '@angular/common';
import {LanguageService} from 'src/app/shared/services/language.service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.scss']
})
export class FileManagerComponent implements OnInit {
  @ViewChild('pd') pdDialog: Dialog;
  @ViewChild('dt') dt: Table;
  @ViewChild('fileUpload') fileUpload: any;
  @ViewChild('fileUpload2') fileUpload2: any;

  @Input()
  itemSlug: string;

  @Input()
  folderSlug: string;

  public form: FormGroup;
  loading: boolean;
  public nextConfig: any;
  files: TreeNode[];
  public UserFolderFiles: any;
  CurrentFolderSlug = '';
  OriCurrentFolderSlug = '';
  CurrentFolderSlugLabel = '';
  IsChangeNode = false;
  createFolderDisplay = false;
  editFolderDisplay = false;
  deleteFolderDisplay = false;
  showPermissionGroups = false;
  CurrentFileSlug = '';
  deleteFileDisplay = false;
  fileLimitDisplay = false;
  first = 0;
  AddFolderName: string;
  EditFolderName: string;
  IsListView = true;
  currentMinPageSize: any;
  currentMaxPageSize: number;
  public uploadAllowedExtensions = '';
  public uploadAllowedFileNumber = 1;
  public uploadAllowedFileSize = 100000;
  public singleFileData: any;
  groupData: any;
  groups: any = [];
  selectedViewerGroups: any = [];
  selectedEditorGroups: any = [];
  isFile = false;
  fileLink = '';
  fileDetailView = false;
  fromDate = '';
  toDate = '';
  showFilter = true;
  Note = '';
  SelectedDeleteFileList: any = [];
  dragFileSlug = '';
  items: MenuItem[];
  treeLoading: boolean;
  tableLoading: boolean;
  visibleNodataFound = true;
  uploadedFiles: any[] = [];
  progress = 0;
  tempFolderName: any = [];
  parentFolderSlugSelected = '';
  selectedFiles;
  dataArray: string[] = [];
  apiToken = '';
  langDir: string;
  isPopup = false;
  isFilemanagerActive = false;

  detailDialogDatapanelVisible = true;

  constructor(
    public translate: TranslateService,
    private languageService: LanguageService,
    private http: HttpClient,
    public fb: FormBuilder,
    private apiService: ApiService,
    private settingsService: SettingsService,
    private route: ActivatedRoute
  ) {
    this.nextConfig = NextConfig.config;
    this.form = fb.group({
      Title: [''],
      Name: [''],
      Slug: [''],
      Created: [''],
      LastEdited: [''],
      CreatedBy: [''],
      UpdatedBy: [''],
      Filename: [''],
      Link: [''],
      opt1: [''],
      opt2: [''],
      opt3: [''],
    });

    this.items = [
      {
        label: 'DeleteFiles', command: () => {
          this.OnDeleteSelectedColumn();
        }
      },
    ];
  }

  async ngOnInit() {
    this.langDir = this.languageService.getLangDir();
    this.isFilemanagerActive = this.settingsService.isActiveApp('everyfilemanager');
    this.currentMinPageSize = this.settingsService.getItemsPerPage();
    this.currentMaxPageSize = this.settingsService.getMaxTotalResults();
    this.uploadAllowedFileSize = this.settingsService.getUploadAllowedFileSize();
    this.uploadAllowedFileNumber = this.settingsService.getUploadAllowedFileNumber();
    this.setNiceUploadAllowedExtensions(this.settingsService.getUploadAllowedExtensions());
    this.route.params.subscribe(async params => {
      if (params['slug']) {
        this.folderSlug = params['slug'];
      }
    });

    this.CurrentFolderSlug = this.folderSlug;
    this.apiToken = this.apiService.getToken();
    await this.BindFileTree();
  }

  async nodeSelect(val) {
    this.CurrentFolderSlug = val.node.data;
    this.CurrentFolderSlugLabel = val.node.text;
    this.IsChangeNode = true;
    this.resetPage();
    this.dt.reset();
    await this.getFileListOfFolder(10, 0);
  }

  onUpload(event) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  resetPage() {
    this.first = 0;
  }

  async BindFileTree() {
    const listOfData = await this.apiService.getFolderTree(this.folderSlug, this.itemSlug);
    if (listOfData) {
      this.files = [];
      this.treeLoading = true;

      this.tempFolderName = [];

      if (!Array.isArray(listOfData)) {
        this.treeLoading = false;
        return;
      }

      listOfData.forEach(element => {
        this.manipulateListData(element, 0, '');
      });

      this.files = listOfData;
      this.treeLoading = false;
      this.CurrentFolderSlug = listOfData[0].href;
      this.OriCurrentFolderSlug = listOfData[0].href;
      this.CurrentFolderSlugLabel = listOfData[0].text;
      const array = [];
      this.tempFolderName.forEach(data => {
        let text = data.name;
        let temp = data.parentFolderSlug;
        if (data.value !== data.parentFolderSlug) {
          for (const c of this.tempFolderName) {
            const tempValue = this.tempFolderName.filter(x => x.value === temp)[0];
            text = tempValue.name + '/' + text;
            temp = tempValue.parentFolderSlug;
            if (this.CurrentFolderSlug === tempValue.value) {
              break;
            } else {
            }
          }
        }
        array.push({
          name: text,
          value: data.value,
          parentFolderSlug: data.parentFolderSlug
        });
      });

      this.tempFolderName = [];
      this.tempFolderName = array;
      await this.getFileListOfFolder(10, 0);
    }
  }

  manipulateListData(folderObj, count, parantvalue) {
    folderObj.label = folderObj.text;
    folderObj.data = folderObj.href;
    folderObj.expandedIcon = 'pi pi-folder-open';
    folderObj.collapsedIcon = 'pi pi-folder';
    folderObj.draggable = false;
    folderObj.droppable = false;
    if (parantvalue === '') {
      parantvalue = folderObj.href;
    }
    folderObj.parentFolderSlug = parantvalue;
    this.tempFolderName.push({
      name: folderObj.text,
      value: folderObj.href,
      parentFolderSlug: folderObj.parentFolderSlug
    });
    if (count === 0) {
      folderObj.expanded = true;
    }
    if (folderObj && folderObj.nodes) {
      parantvalue = folderObj.href;
      folderObj.children = folderObj.nodes;
      folderObj.nodes.forEach(nestedfolderobj => {
        this.manipulateListData(nestedfolderobj, 1, parantvalue);
      });
    }
  }

  public async getFileListOfFolder(rows, start) {
    this.tableLoading = true;
    this.UserFolderFiles = [];

    this.UserFolderFiles = await this.apiService.getFolderFiles(
      this.CurrentFolderSlug, this.itemSlug, rows, start, this.fromDate, this.toDate);

    if (this.UserFolderFiles.aaData != null && this.UserFolderFiles.aaData !== '') {
      this.UserFolderFiles.aaData.forEach(element => {
        const data = element.Name.substring(element.Name.lastIndexOf('.') + 1).toLowerCase();
        if (data === 'pdf') {
          element.isImage = false;
          element.fileIcon = 'fa fa-2x fa-file-pdf-o';
        } else if (data === 'doc' || data === 'docx') {
          element.isImage = false;
          element.fileIcon = 'fa fa-2x fa-file-word-o';
        } else if (data === 'jpge' || data === 'jpg' || data === 'png') {
          element.isImage = true;
          element.fileIcon = 'fa fa-2x fa-file-image-o';
        } else {
          element.isImage = false;
          element.fileIcon = 'fa fa-2x fa-file';
        }
      });
      this.visibleNodataFound = this.UserFolderFiles.aaData.length <= 0;
    } else {
      this.visibleNodataFound = true;
    }
    if (this.UserFolderFiles.resultListLabels && this.UserFolderFiles.resultListLabels.length > 0) {
      const changeValues = this.UserFolderFiles.resultListLabels.filter(x => x.data === 'Slug');
      if (changeValues.length > 0) {
        changeValues[0].data = 'Action';
      }
    }
    this.dataArray = [this.CurrentFolderSlug];
    this.checkNode(this.files, this.dataArray);

    this.tableLoading = false;
  }

  checkNode(nodes: TreeNode[], str) {
    nodes.forEach(node => {
      if (str === node.data) {
        // this.selectedFiles.push(node);
        this.selectedFiles = node;
      }

      if (node.children !== undefined) {
        node.children.forEach(child => {
          // check child if the parent is not selected
          if (str === child.data && str !== node.data) {
            node.partialSelected = true;
            child.parent = node;
          }

          // check the child if the parent is selected
          // push the parent in str to new iteration and mark all the childs
          if (str === node.data) {
            child.parent = node;
          }
        });
      } else {
        return;
      }

      this.checkNode(node.children, str);

      node.children.forEach(child => {
        if (child.partialSelected) {
          node.partialSelected = true;
        }
      });
    });
  }

  async loadLazyData(event) {
    await this.getFileListOfFolder(event.rows, event.first);
  }

  async ImageUpload(event) {
    if (event.files && event.files.length > 0) {

      const files = event.files;
      if (files.length > this.nextConfig.FileNumber) {
        this.fileLimitDisplay = true;
      } else {
        this.tableLoading = true;
        $('.p-fileupload-files').css('display', 'block');
        $('.p-fileupload-content').css('background', 'white');
        this.UserFolderFiles = [];

        await this.apiService.postUploadFiles(this.CurrentFolderSlug, files);
        this.fileUpload.clear();
        this.fileUpload2.clear();
        $('.p-fileupload-files').css('display', 'none');
        $('.p-fileupload-content').css('background', 'transparent');
        this.getFileListOfFolder(10, 0);
      }
    }
  }

  async onTableRowSelect(event) {
    await this.getFileDataAndShowFileDialogue(true, event);
  }

  showCreateFolderDialog() {
    this.createFolderDisplay = true;
    this.AddFolderName = '';
  }

  showEditFolderDialog() {
    this.editFolderDisplay = true;
    this.EditFolderName = this.CurrentFolderSlugLabel;
    this.parentFolderSlugSelected = this.CurrentFolderSlug;
  }

  showDeleteFolderDialog() {
    this.deleteFileDisplay = true;
  }

  clearFileUploader() {
    this.fileUpload.clear();
    this.fileUpload2.clear();
    this.fileLimitDisplay = false;
  }

  printfile() {
    if (this.isFile) {
      const url = this.fileLink;
      const mywindows = window.open(url, '_blank');
      mywindows.onload = _ => {
        window.print();
      };
    } else {

      const printContents = document.getElementById('printimage').innerHTML;
      const w = window.open();

      w.document.write(printContents);
      w.document.write('<scr' + 'ipt type="text/javascript">' + 'window.onload = function() { window.print(); window.close(); };' + '</sc' + 'ript>');

      w.document.close();
      w.focus();

      return true;
    }
  }

  async AddNewFolder() {
    await this.apiService.postSetFolder(this.AddFolderName, '', this.CurrentFolderSlug, this.itemSlug);
    this.AddFolderName = '';
    this.createFolderDisplay = false;
    await this.BindFileTree();
  }

  DeleteCurrentSlug() {
    this.deleteFileDisplay = true;
    this.CurrentFileSlug = this.singleFileData.Slug;
  }

  DeleteCurrentFileSlug(slug) {
    this.deleteFileDisplay = true;
    this.CurrentFileSlug = slug;
  }

  DeleteFile(deleteType) {
    const deleteResult = this.DeleteSlugRecord(
      deleteType, this.CurrentFileSlug != null && this.CurrentFileSlug !== '' ? this.CurrentFileSlug : this.CurrentFolderSlug);
    if (deleteResult) {
      this.BindFileTree();
      this.deleteFileDisplay = false;
      this.fileDetailView = false;
      this.SelectedDeleteFileList = [];
      this['IsChkCheckAll'] = false;
    } else {
      this.deleteFileDisplay = false;
    }
  }

  async DeleteSlugRecord(deleteType, slug) {
    const items: any[] = [];
    if (this.SelectedDeleteFileList.length > 0) {
      this.SelectedDeleteFileList.forEach(data => {
        items.push(data);
      });
    } else {
      items.push(slug);
    }

    return await this.apiService.postDeleteFiles(items, deleteType);
  }

  DeleteFolder(deleteType) {
    if (this.CurrentFolderSlug !== this.OriCurrentFolderSlug) {
      if (this.DeleteSlugRecord(deleteType, this.CurrentFolderSlug)) {
        this.deleteFolderDisplay = false;
        this.BindFileTree();
      }
    } else {
      this.deleteFolderDisplay = false;
    }
  }

  async RenameFileName() {
    let parentFolder;
    if (this.CurrentFolderSlug === this.parentFolderSlugSelected) {
      const tempvalue = this.tempFolderName.filter(x => x.value === this.parentFolderSlugSelected)[0];
      parentFolder = tempvalue.parentFolderSlug;
    } else {
      parentFolder = this.parentFolderSlugSelected;
    }
    await this.apiService.postSetFolder(this.EditFolderName, this.CurrentFolderSlug, this.CurrentFolderSlug, this.itemSlug, parentFolder);
    this.EditFolderName = '';
    this.editFolderDisplay = false;
    this.BindFileTree();
  }

  OnListView() {
    this.IsListView = true;
  }

  OnGridView() {
    this.IsListView = false;
  }

  async onSearch() {
    /*
        this.currentMinPageSize = this.minPageSize;
        this.currentMaxPageSize = this.maxPageSize;
    */
    await this.getFileListOfFolder(10, 0);
  }

  async getFileDataAndShowFileDialogue(event, fileSlug) {
    const response = await this.apiService.getFileData(fileSlug);
    this.getGroups();
    if (fileSlug !== '') {
      this.singleFileData = response;
      if (this.singleFileData.ViewerGroupSlugs !== undefined) {
        if (this.singleFileData.ViewerGroupSlugs.length > 0) {
          this.selectedViewerGroups = this.singleFileData.ViewerGroupSlugs;
        }
      }
      if (this.singleFileData.EditorGroupSlugs !== undefined) {
        if (this.singleFileData.EditorGroupSlugs.length > 0) {
          this.selectedEditorGroups = this.singleFileData.EditorGroupSlugs;
        }
      }
      const index = (['svg', 'jpeg', 'jpg', 'png'].indexOf(
        this.singleFileData.Filename.toLowerCase().split('.')[this.singleFileData.Filename.split('.').length - 1]));
      this.isFile = (index === -1);
      this.fileDetailView = true;
      this.fileLink = this.singleFileData.Link;
      this.singleFileData.fileCanViewType = this.singleFileData.CanViewType;
    }

  }

  async getGroups() {
    const response = await this.apiService.getGroups();
    this.groups = [];
    this.groupData = response;
    this.groupData.forEach(element => {
      this.groups.push({label: element.Title, value: element.Slug});
    });
  }


  showDialogMaximized() {
    setTimeout(() => {
      this.pdDialog.maximize();
    }, 0);
  }

  async submitFileData() {
    const fileData: FileData = new FileData();

    fileData.Name = this.singleFileData.Name;
    fileData.Title = this.singleFileData.Title;
    fileData.Slug = this.singleFileData.Slug;
    fileData.Created = this.singleFileData.Created;
    fileData.LastEdited = this.singleFileData.LastEdited;
    fileData.CreatedBy = this.singleFileData.CreatedBy;
    fileData.UpdatedBy = this.singleFileData.UpdatedBy;
    fileData.Filename = this.singleFileData.Filename;
    fileData.Link = this.singleFileData.Link;
    fileData.CanViewType = this.singleFileData.fileCanViewType;
    if (this.selectedViewerGroups.length > 0) {
      this.selectedViewerGroups.forEach(element => {
        fileData.ViewerGroupSlugs.push(element);
      });
    }

    if (this.selectedEditorGroups.length > 0) {
      this.selectedEditorGroups.forEach(element => {
        fileData.EditorGroupSlugs.push(element);
      });
    }

    await this.apiService.postEditFileData(fileData);
    this.getFileDataAndShowFileDialogue('', this.singleFileData.Slug);
  }

  OnFiltervisable() {
    this.showFilter = this.showFilter === false;
  }

  async submitNoteDate(fileSlug) {
    await this.apiService.postAddNoteToFile(fileSlug, this.Note);
    this.Note = '';
    this.getFileDataAndShowFileDialogue('', this.singleFileData.Slug);
  }

  async deleteNote(noteSlug) {
    await this.apiService.postDeleteNote(noteSlug);
    this.Note = '';
    this.getFileDataAndShowFileDialogue('', this.singleFileData.Slug);
  }

  closeFileDialog() {
    this.fileDetailView = false;
  }

  OnDeleteSelectedColumn() {
    this.SelectedDeleteFileList = [];
    this.UserFolderFiles.aaData.forEach(data => {
      if (this['IsChkCheck-' + data.Slug]) {
        this.SelectedDeleteFileList.push(data.Slug);
      }
    });

    if (this.SelectedDeleteFileList.length > 0) {
      this.deleteFileDisplay = true;
    }
  }

  OnSelectAll() {
    if (this['IsChkCheckAll']) {
      this.UserFolderFiles.aaData.forEach(data => {
        this['IsChkCheck-' + data.Slug] = true;
      });
    } else {
      this.UserFolderFiles.aaData.forEach(data => {
        this['IsChkCheck-' + data.Slug] = false;
      });
    }

  }

  dragStart(event, data) {
    this.dragFileSlug = '';
    this.dragFileSlug = data;
  }


  async onDrop(event, val) {
    let data: FileData;

    data = await this.apiService.getFileData(this.dragFileSlug);
    await this.apiService.postEditFileData(data, val.href);
    this.dragFileSlug = '';
    this.CurrentFolderSlug = val.href;
    this.CurrentFolderSlugLabel = val.text;
    this.getFileListOfFolder(10, 0);
  }

  filter() {
  }

  async OnPermissionGroups(val) {
    this.showPermissionGroups = val;
  }

  async onCreatedFrom(event) {
    const format = 'yyyy-MM-dd';
    this.fromDate = formatDate(event, format, 'en-US');
  }

  async onCreatedTo(event) {
    const format = 'yyyy-MM-dd';
    this.toDate = formatDate(event, format, 'en-US');
  }

  setNiceUploadAllowedExtensions(extensions) {

    if (extensions) {
      for (const extension of extensions) {
        this.uploadAllowedExtensions += extension.value + ',';
      }
    }
  }
}
