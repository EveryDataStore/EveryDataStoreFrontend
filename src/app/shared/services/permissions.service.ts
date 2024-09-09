import { ApiService } from 'src/app/shared/services/api.service';
import { Injectable } from '@angular/core';
import { TokenResult } from '../models/entities/token-result';

export enum Task {
  CREATE = 'CREATE', DELETE = 'DELETE', EDIT = 'EDIT', VIEW = 'VIEW', PRIMARY_MENU = 'PRIMARY_MENU', ADMIN_MENU = 'ADMIN_MENU', USER_MENU = 'USER_MENU', INSTALL = 'INSTALL',  DEINSTALL = 'DEINSTALL', ROLLBACK = 'ROLLBACK', IMPORT = 'IMPORT', EXPORT = 'EXPORT', PRINT = 'PRINT'  
}

export class Permissions {
  canCreate: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  canView: boolean = false;
  canViewPrimaryMenu: boolean = false;
  canViewAdminMenu: boolean = false;
  canViewUserMenu: boolean = false;
  canRollback: boolean = false;
  canInstall: boolean = false;
  canDeinstall: boolean = false;
  canImport: boolean = false;
  canExport: boolean = false;
  canPrint: boolean = false;
  
}

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  private permissionsData: any;
  private x: Promise<unknown>;

  constructor(private apiService: ApiService) {
  }

  async initialize() {
    const user : TokenResult = this.apiService.getUserInfo() as unknown as TokenResult;
    this.permissionsData = await this.apiService.getUserPermissions(user.Slug);
  }

  public async getPermissionsForModel(modelName: string): Promise<Permissions> {
    if (this.permissionsData === undefined) {
      await this.initialize();
    }

    if(modelName == 'Record'){
        modelName = 'RecordSet'
    }
    
    if(modelName == 'RecordItem'){
        modelName = 'RecordSetItem'
    }

   const result: Permissions = {
      canCreate: this.canDo(modelName, Task.CREATE),
      canEdit: this.canDo(modelName, Task.EDIT),
      canDelete: this.canDo(modelName, Task.DELETE),
      canView: this.canDo(modelName, Task.VIEW),
      canViewPrimaryMenu: this.canDo(modelName, Task.PRIMARY_MENU),
      canViewAdminMenu: this.canDo(modelName, Task.ADMIN_MENU),
      canViewUserMenu: this.canDo(modelName, Task.USER_MENU),
      canRollback: this.canDo(modelName, Task.ROLLBACK),
      canInstall: this.canDo(modelName, Task.INSTALL),
      canDeinstall: this.canDo(modelName, Task.DEINSTALL),
      canImport: this.canDo(modelName, Task.IMPORT),
      canExport: this.canDo(modelName, Task.EXPORT),
      canPrint: this.canDo(modelName, Task.PRINT)
    }
    return result;
  }

  private canDo(modelName: string, task: Task): boolean {
    
    if (this.permissionsData === undefined) return false;
    if (this.permissionsData === null) return false;
    if (this.permissionsData[modelName] === undefined) return false;
    if (typeof this.permissionsData[modelName] !== 'object') return false;
    
    let result = false;
    
    const permissions = this.permissionsData[modelName];
    Object.keys(permissions).forEach(key => {
      if (key.startsWith(task)) {
        result = permissions[key];
      }
    })

    return result;
  }
}

