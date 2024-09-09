import { ServicesProviderService } from './../../services/services-provider.service';
import { TranslateService } from '@ngx-translate/core';
import { plainToClass, plainToInstance } from 'class-transformer';
import { TextField } from '../fieldtypes/text-field';
import { DropdownField } from '../fieldtypes/dropdown-field';
import { DropdownSelectField } from '../fieldtypes/dropdown-select-field';
import { CheckboxField } from '../fieldtypes/checkbox-field';
import { TextareaField } from '../fieldtypes/textarea-field';
import { HiddenField } from '../fieldtypes/hidden-field';
import { FormMetaField } from './form-meta-field';
import { FieldType } from '../field-type';
import { UploadField } from '../fieldtypes/upload-field';
import { RelationField } from '../fieldtypes/relation-field';
import { TexteditorField } from '../fieldtypes/texteditor-field';


export class FormMetaFieldFactory {

  public static createFromAPIobject(apiMetaField: any, servicesProviderService: ServicesProviderService): FormMetaField {
    let metaFieldObject: FormMetaField;

    const apiMetaFieldObject = JSON.parse(JSON.stringify(apiMetaField));

    const classType = FormMetaFieldFactory.getClassTypeFromFieldType(apiMetaFieldObject.Type);
    metaFieldObject = FormMetaFieldFactory.createFromObject<typeof classType>(apiMetaFieldObject, classType);
    metaFieldObject.setServicesProviderService(servicesProviderService);
    metaFieldObject.afterSetup();

    return metaFieldObject;
  }

  public static createNew(type: string, servicesProviderService: ServicesProviderService): FormMetaField {
    let result: FormMetaField = null;
    const keys = Object.keys(FieldType).filter(x => FieldType[x] === type);
    if (keys.length >= 0) {
      const classType = FormMetaFieldFactory.getClassTypeFromFieldType(FieldType[keys[0]]);
      result = new classType();
    }
    result.setServicesProviderService(servicesProviderService);
    return result;
  }

  private static getClassTypeFromFieldType(fieldType: FieldType): any {
    let classType: any;
    switch (fieldType) {
      case FieldType.TextField:
        classType = TextField;
        break;
      case FieldType.DropdownField:
        classType = DropdownField;
        break;
      case FieldType.DropdownSelectField:
        classType = DropdownSelectField;
        break;
      case FieldType.CheckboxField:
        classType = CheckboxField;
        break;
      case FieldType.TextareaField:
        classType = TextareaField;
        break;
      case FieldType.HiddenField:
        classType = HiddenField;
        break;
      case FieldType.UploadField:
        classType = UploadField;
        break;
      case FieldType.RelationField:
        classType = RelationField;
        break;
      default:
        classType = TextField;
        break;
      case FieldType.TexteditorField:
        classType = TexteditorField;
        break;
    }
    return classType;
  }

  private static createFromObject<T>(apiMetaField: any, type): T {
    return plainToInstance<any, T>(type, apiMetaField) as unknown as T;
  }

  // tslint:disable-next-line: ban-types
  private static mapObjKey(o: Object, oldKey: string, newKey: string) {
    o[newKey] = o[oldKey];
    delete o[oldKey];
  }


}
