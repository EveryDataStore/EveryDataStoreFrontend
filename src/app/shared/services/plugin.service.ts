import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap } from 'rxjs/operators';

type PluginServiceDataFunction = (data: PluginServiceData) => Promise<void>;
type ObjAndFunc = {
  obj: any;
  fnc: PluginServiceDataFunction;
}

type HookFunction = {
  hook: Hooks;
  functions: ObjAndFunc[]
};

export enum Hooks {
  OnRelationFieldItemChanged,
  OnReloadActualRecordItem,
  AfterFilledRelationFieldValuesFromMapping
}

@Injectable({
  providedIn: 'root'
})
export class PluginService {

  private hookFunctions: HookFunction[] = [];

  constructor() {
  }

  public subscribe(hook: Hooks, obj: any, fnc: PluginServiceDataFunction) {
    this.getHookFunctions(hook).push(
      {obj, fnc});
  }

  public unsubscribe(hook: Hooks, obj: any) {
    const fncs = this.hookFunctions.find(hf => hf.hook === hook);
    if (fncs) {
      fncs.functions = fncs.functions.filter(fn => fn.obj !== obj);
    }
  }

  public unsubscribeAll(obj: any) {
    this.hookFunctions.forEach(hf => hf.functions = hf.functions.filter(fn => fn.obj !== obj));
  }

  public async fire(hook: Hooks, data: PluginServiceData) {
    for (const objAndFnc of this.getHookFunctions(hook)) {
      const fnc = objAndFnc.fnc;
      const fncBound = fnc.bind(objAndFnc.obj);
      await fncBound(data);
    }
  }

  private getHookFunctions(hook: Hooks) {
    const fncs = this.hookFunctions.find(hf => hf.hook === hook);
    if (fncs) {
      return fncs.functions;
    } else {
      const hookFunction: HookFunction = {
        hook,
        functions: []
      };
      this.hookFunctions.push(hookFunction);
      return hookFunction.functions;
    }
  }
}

export class PluginServiceData {
  public data: any;
  public caller: any;

  constructor(caller: any, data: any = null) {
    this.caller = caller;
    this.data = data;
  }
}
