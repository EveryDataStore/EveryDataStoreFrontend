import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../../shared/services/api.service';
import { BusyService } from '../../../../shared/services/busy.service';
import { MessageUtilService } from '../../../../shared/services/message-util.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-status-update-modal',
  templateUrl: './task-status-update-modal.component.html',
  styles: [`
   :host::ng-deep .manual-dropdown {
      width: 100%;
      font-size: 14px;
      color: #333333;
      background: #ffffff;
      padding: 0.429em;
      border: 1px solid #a6a6a6;
      -webkit-transition: border-color 0.2s;
      transition: border-color 0.2s;
      margin: 0;
      outline: medium none;
      font-weight: normal;
      border-radius: 3px;
      margin-bottom: 10px;
    }
   :host::ng-deep .edit-task-input-row{
    display:block;
margin-top:15px;
    }
    :host::ng-deep .edit-task-input-row label{
        font-weight: bold;
    }
  `]
})
export class TaskStatusUpdateModalComponent implements OnInit {

  @Input()
  visible: boolean;


  @Output()
  public onHideEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public acceptEvent: EventEmitter<any> = new EventEmitter<any>();

  public status: string;
  public note: string;
  members: any;
  groups: any;

  membersList: any[];
  groupList: any[];

  public taskInfo: any;

  constructor(private route: ActivatedRoute,
              public apiService: ApiService){
  }

  async ngOnInit() {
    if( this.route.snapshot.queryParamMap.get('task')){
        await this.getGroups();
        await this.getMembers();
        this.taskInfo = await this.apiService.getTask( this.route.snapshot.queryParamMap.get('task'));
        this.initializeForm();
    }
  }

  async getMembers() {
    this.membersList = await this.apiService.getMembers();
    this.membersList.forEach((member: any) => {
      member.fullName = member.FirstName + ' ' + member.Surname;
    });

  }

  async getGroups() {
    this.groupList = await this.apiService.getGroups();
  }

  initializeForm() {
    if (this.taskInfo) {
    const selectedGroups = this.taskInfo.Groups.length > 0 ?  this.taskInfo.Groups :  this.taskInfo.ActionGroups;
    const selectedMembers = this.taskInfo.Members.length > 0 ?  this.taskInfo.Members :  this.taskInfo.ActionMembers;
      if (this.taskInfo.Note) {
        this.note = this.taskInfo.Note;
      }
      if (this.taskInfo.Status) {
        this.status = this.taskInfo.Status;
      }
      if (selectedGroups) {
        selectedGroups.forEach((group: any) => {
          if (!this.groups) {
            this.groups = [];
          }
          const res = this.groupList.filter((item: any) => item.Slug === group.Slug)[0];
          if (res) {
            this.groups.push(res);
          }
        });
      }

      if (selectedMembers) {
        selectedMembers.forEach((member: any) => {
          if (!this.members) {
            this.members = [];
          }
          const res = this.membersList.filter((item: any) => item.Slug === member.Slug)[0];
          if (res) {
            this.members.push(res);
          }
        });
      }
    }
  }

  onHide() {
    this.onHideEvent.emit('');
  }

  dismiss() {
    this.onHide();
  }

  async accept() {
    const members = [];
    const groups = [];
    if (this.members && this.members.length > 0) {
      for await (const member of this.members) {
        members.push(member.Slug);
      }
    }
    if (this.groups && this.groups.length > 0) {
      for await (const group of this.groups) {
        groups.push(group.Slug);
      }
    }
    const obj = {
      Fields: {
        Status: this.status,
        Note: this.note,
        Groups: groups,
        Members: members
      }
    };
    this.acceptEvent.emit(obj);
    this.dismiss();
  }
}
