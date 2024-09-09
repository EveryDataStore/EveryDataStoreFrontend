import { BaseFieldComponent } from '../../form-builder/components/fieldtypes/base-field/base-field.component';
import { RecordItem, RecordItemFieldValue } from '../models/entities/record-item';
import { FieldType } from '../models/field-type';
import { UploadFieldComponent } from 'src/app/form-builder/components/fieldtypes/upload-field/upload-field.component';
import { Subject } from 'rxjs';

export class FieldCollectionService {

  private fieldComponents: BaseFieldComponent[] = [];
  private fieldsCounter = 0;

  private fieldsLoadingFinishedSubject: Subject<boolean>;
  private fieldValueChangedSubject: Subject<BaseFieldComponent>;

  public mainRecordItemSlug: string;
  private subFormRecordItemSlugs: {slug: string, order: number}[] = [];

  public listenToFieldsLoadingFinished() {
    return this.fieldsLoadingFinishedSubject;
  }

  public listenToFieldValueChanged() {
    return this.fieldValueChangedSubject;
  }

  onLoadFinished(field: BaseFieldComponent) {
      this.fieldsCounter--;
      if (this.fieldsCounter <= 0) {
        this.fieldsLoadingFinishedSubject.next(true);
      }
  }

  constructor() {
    this.fieldsLoadingFinishedSubject = new Subject<boolean>();
    this.fieldValueChangedSubject = new Subject<BaseFieldComponent>();
  }

  public add(field: BaseFieldComponent) {
    this.fieldComponents.push(field);
    this.fieldsCounter++;
  }

  public removeComponentsByRecordItemSlug(recordItemSlug: string) {
    this.fieldComponents = this.fieldComponents.filter(fc => fc.recordItemSlug !== recordItemSlug);
    this.fieldsCounter = this.fieldComponents.length;
    this.removeSubFormRecordItemSlug(recordItemSlug);
  }

  public onFieldValueChanged(field: BaseFieldComponent) {
    this.fieldValueChangedSubject.next(field);
  }

  public clear() {
    this.fieldComponents = [];
    this.fieldsCounter = 0;
    this.subFormRecordItemSlugs = [];
  }

  public get(): BaseFieldComponent[] {
    return this.fieldComponents;
  }

  public findByFieldSlug(fieldSlug: string) {
    return this.fieldComponents.find(fc => fc.getSlug() === fieldSlug);
  }

  public findInRecordItem(recordItemSlug: string, fieldSlug: string) {
    return this.fieldComponents.find(fc => fc.recordItemSlug === recordItemSlug && fc.getSlug() === fieldSlug);
  }

  public setFieldValue(fieldSlug: string, value: any) {
    const field = this.findByFieldSlug(fieldSlug);
    if (field) {
      field.setValue(value);
    }
  }

  public getFieldValue(fieldSlug: string, defaultValue: any = null) {
    const field = this.findByFieldSlug(fieldSlug);
    if (field) {
      return field.getValue();
    }
    return defaultValue;
  }

  public addSubFormRecordItemSlug(recordItemSlug: string, order) {
    this.subFormRecordItemSlugs.push({slug: recordItemSlug, order});
  }

  public removeSubFormRecordItemSlug(recordItemSlug: string) {
    this.subFormRecordItemSlugs = this.subFormRecordItemSlugs.filter(sub => sub.slug !== recordItemSlug);
  }

  public createRecordItemFromComponentValues(): RecordItem {
    const validationErrors = this.validationErrors();
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    const recordItem = new RecordItem();

    // main form fields
    this.get()
      .filter(c => c.recordItemSlug === this.mainRecordItemSlug)
      .forEach(c => {
        recordItem.Fields.push(this.createRecordItemFieldFromComponent(c));
    });

    // sub forms fields
    this.subFormRecordItemSlugs.sort((a, b) => a.order > b.order ? 1 : -1);

    this.subFormRecordItemSlugs.forEach(sub => {
      const fields = [];
      const recordItemSlug = sub.slug;
      this.get()
        .filter(c => c.recordItemSlug === recordItemSlug)
        .forEach(c => fields.push(this.createRecordItemFieldFromComponent(c)));

      recordItem.RecordItems.push(
        {
          Slug: recordItemSlug,
          Fields: fields
        }
      );
    });

    return recordItem;
  }

  public createFieldsForAdminSave() {
    const fields = {};
    this.get().forEach((component: any) => {
      let value = component.getValue();
      if (component.formMetaField.type === FieldType.UploadField) {
        value = component.uploadedFiles;
      }
      if ((value === null) || (value === undefined)) {
        value = '';
      }
      fields[component.formMetaField.name] = value;
    });
    return fields;
  }


  private validationErrors(): string[] {
    const validationErrors: string[] = [];
    this.get().forEach(component => {
      component.validate();
      if (component.getErrorMessages().length > 0) {
        component.getErrorMessages().forEach(message =>
          validationErrors.push(component.formMetaField.label + ': ' + message));
      }
    });

    return validationErrors;
  }

  private createRecordItemFieldFromComponent(component: BaseFieldComponent): RecordItemFieldValue {
    const recordItemField = new RecordItemFieldValue();
    let value = component.getValue();
    if ((value === null) || (value === undefined)) {
      value = '';
    }
    recordItemField.Slug = component.getSlug();
    if (component.formMetaField && component.formMetaField.type === FieldType.UploadField) {
      const uploadComponent = component as UploadFieldComponent;
      const files = (uploadComponent.uploadedFiles && uploadComponent.uploadedFiles.length > 0) ?
                      uploadComponent.uploadedFiles : component.value;
      recordItemField.Value = files;
      if (uploadComponent.fileUpload) {
        uploadComponent.fileUpload.clear();
        uploadComponent.show = true;
      }
    } else {
      recordItemField.Value = value;
    }
    return recordItemField;
  }
}

