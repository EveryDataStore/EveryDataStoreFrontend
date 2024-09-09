import { ViewFileDialogComponent } from './../../../plugins/file-manager/view-file-dialog/view-file-dialog.component';
import { ApiService } from './../../../shared/services/api.service';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FileInfo } from 'src/app/shared/models/entities/file-info';

@Component({
  selector: 'app-item-view',
  templateUrl: './item-view.component.html',
  styleUrls: ['./item-view.component.scss']
})
export class ItemViewComponent implements OnInit {

  @Input()
  data;

  @ViewChild('viewFileDialog')
  viewFileDialog: ViewFileDialogComponent;

  token = '';
  isImage: boolean = false;
  isDoc: boolean = false;
  fileLink: string;
  imageURL: string;

  constructor(private apiService: ApiService) {
    this.token = this.apiService.getToken();
   }

  ngOnInit() {}
  
  async openFileViewer(fileInfo: FileInfo){
    await this.viewFileDialog.show(fileInfo);
  }


}
