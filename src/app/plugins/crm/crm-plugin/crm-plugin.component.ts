import { AsyncConfirmationService } from '../../../shared/services/async-confirmation.service';
import { Hooks, PluginService, PluginServiceData } from '../../../shared/services/plugin.service';
import { SettingsService } from '../../../shared/services/settings.service';
import { SubRecordItemInfo } from '../../../shared/models/entities/record-form-data';
import { BusyService } from '../../../shared/services/busy.service';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { BaseFieldComponent } from '../../../form-builder/components/fieldtypes/base-field/base-field.component';
import { FieldCollectionService } from '../../../shared/services/field-collection.service';
import { CustomRecordFormData } from '../../../shared/models/entities/custom-record-form-data';
import { ApiService } from '../../../shared/services/api.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RecordFormData } from 'src/app/shared/models/entities/record-form-data';
import { FormMode } from 'src/app/form-builder/form-builder.component';
import { RelationFieldComponent } from 'src/app/form-builder/components/fieldtypes/relation-field/relation-field/relation-field.component';
import { CrmDefaultCurrency, CrmDiscountDef, CrmItemDef, CrmPositionItemDef, CrmRecordAndFields, CrmTaxRateDef } from './crm-settings';
import { NumberFormatService } from 'src/app/shared/services/number-format.service';


class FormInformation {
  recordFormData: CustomRecordFormData;
  recordItemSlug: string;
  type: FormType;
  sum?: string;
  autoOpen?: boolean;
  positionItemDef: CrmPositionItemDef;
}

class PositionSum {
  netto = 0;
  tax = 0;
  taxRateName: string;
  discount = 0;
  brutto = 0;
}

enum FormType {
  Product, Service
}

@Component({
  selector: 'app-crm-plugin',
  templateUrl: './crm-plugin.component.html',
  styleUrls: ['./crm-plugin.component.scss']
})
export class CrmPluginComponent implements OnInit, OnDestroy {

  @Input()
  formData: RecordFormData;

  @Input()
  fieldCollectionService: FieldCollectionService;

  @Input()
  parentRecordSlug: string;

  @Input()
  parentRecordItemSlug: string;

  formInformations: FormInformation[] = [];

  // data from settings
  recordAndFields: CrmRecordAndFields;
  servicePositionItemDef: CrmPositionItemDef;
  productPositionItemDef: CrmPositionItemDef;
  taxRateDef: CrmTaxRateDef;
  discountDef: CrmDiscountDef;
  defaultCurrency: CrmDefaultCurrency;
  serviceDef: CrmItemDef;
  productDef: CrmItemDef;

  // the fields that set the previous document that actual document refers to (e.g. the sales order from which the delivery note should be composed off)
  documentSelectorFields: string[] = [];

  showPlugin = false;
  showAddProductButton = true;
  showAddServiceButton = true;
  FormModeEnum = FormMode;

  settings: any;

  constructor(private apiService: ApiService,
              private confirmationService: ConfirmationService,
              private translateService: TranslateService,
              private busyService: BusyService,
              private settingsService: SettingsService,
              private pluginService: PluginService,
              private numberFormatService: NumberFormatService,
              private asyncConfirmationService: AsyncConfirmationService
              ) {
    // wire relation field item changed hook
    this.pluginService.subscribe(Hooks.OnRelationFieldItemChanged, this, this.relationFieldItemChangedHook);
    this.pluginService.subscribe(Hooks.AfterFilledRelationFieldValuesFromMapping, this, this.afterRelationFieldValuesFilledHook);
  }

  ngOnDestroy(): void {
    this.pluginService.unsubscribeAll(this);
  }

  async ngOnInit() {

    const crmRecordsAndFields = this.settingsService.getCrmRecordsAndFields();

    if (Object.keys(crmRecordsAndFields).length === 0) {
      return;
    }

    this.recordAndFields = crmRecordsAndFields.find(s => s.recordSlug === this.parentRecordSlug);
    this.showPlugin = (this.recordAndFields !== undefined) ? true : false;
    if (!this.showPlugin) {
      return;
    }

    this.servicePositionItemDef = this.settingsService.getCrmServiceItemDef();
    this.productPositionItemDef = this.settingsService.getCrmProductItemDef();
    this.taxRateDef = this.settingsService.getCrmTaxRateDef();
    this.discountDef = this.settingsService.getDiscountDef();
    this.defaultCurrency = this.settingsService.getCrmDefaultCurrency();
    this.productDef = this.settingsService.getCrmProductDef();
    this.serviceDef = this.settingsService.getCrmServiceDef();

    this.documentSelectorFields = this.settingsService.getCrmDocumentSelectorFields();

    if (this.formData.RecordItems && this.formData.RecordItems.length > 0) {

      this.busyService.show();
      this.formData.RecordItems.forEach(async subRecordItemInfo => {
        await this.addRecordItem(subRecordItemInfo);
      });
      this.busyService.hide();
    }

    this.fieldCollectionService.listenToFieldsLoadingFinished().subscribe(_ => {
      this.fieldCollectionService.listenToFieldValueChanged().subscribe(field => this.onFieldValueChanged(field));
      this.doCalculation();
    });

    this.setButtonVisibility();
  }

  private setButtonVisibility() {
    if (this.recordAndFields.addItemButtonsAvailable) {
      this.showAddProductButton = false;
      this.showAddServiceButton = false;
      if (this.recordAndFields.addItemButtonsAvailable.includes('product')) {
        this.showAddProductButton = true;
      }
      if (this.recordAndFields.addItemButtonsAvailable.includes('service')) {
        this.showAddServiceButton = true;
      }
    }
  }

  async onAddServiceClicked() {
    await this.addItemPos(this.servicePositionItemDef, FormType.Service);
  }

  async onAddProductClicked() {
    await this.addItemPos(this.productPositionItemDef, FormType.Product);
  }

  private async addItemPos(positionItemDef: CrmPositionItemDef, formType: FormType) {
    const newItemSlug = await this.apiService.createRecordItem(positionItemDef.recordSlug);
    const recordFormData = await this.apiService.getRecordFormData(positionItemDef.recordSlug, newItemSlug);
    this.formInformations.push({
        recordFormData,
        recordItemSlug: newItemSlug,
        type: formType,
        autoOpen: true,
        positionItemDef});
  }

  private async addRecordItem(subRecordItemInfo: SubRecordItemInfo) {
    const recordSlug = subRecordItemInfo.Record.Slug;
    const recordItemSlug = subRecordItemInfo.RecordSetItemSlug;

    // create and push formInfo immediately to avoid different order with every reload, cause its running async for faster loading
    const formInformation: FormInformation = new FormInformation();
    formInformation.type = (recordSlug === this.servicePositionItemDef.recordSlug) ? FormType.Service : FormType.Product;
    formInformation.recordItemSlug = recordItemSlug;
    this.formInformations.push(formInformation);

    if ((recordSlug === this.servicePositionItemDef.recordSlug) || (recordSlug === this.productPositionItemDef.recordSlug)) {
      const recordFormData = await this.apiService.getRecordFormData(recordSlug, recordItemSlug);
      formInformation.recordFormData = recordFormData;
    }
  }

  async removePosition(formInformation: FormInformation) {
    this.confirmationService.confirm({
      header:  await this.translateService.get('question').toPromise(),
      message: await this.translateService.get('confirm.really-remove-position').toPromise(),
      accept: async _ => {
        this.formInformations = this.formInformations.filter(fi => fi.recordItemSlug !== formInformation.recordItemSlug);
        this.fieldCollectionService.removeComponentsByRecordItemSlug(formInformation.recordItemSlug);
        this.doCalculation();
        this.apiService.deleteRecordItem(formInformation.recordItemSlug, 'physically');
      }
    });

  }

  onFieldValueChanged(field: BaseFieldComponent) {
    if ((this.hasFieldChanged(field.getSlug(), this.productPositionItemDef))
      || (this.hasFieldChanged(field.getSlug(), this.servicePositionItemDef)
      || (field.getSlug() === this.recordAndFields.discountPercentFieldSlug))) {
        this.doCalculation();
    }
  }

  private hasFieldChanged(fieldSlug: string, itemDef: CrmPositionItemDef) {
    return ((fieldSlug === itemDef.amountFieldSlug)
            || (fieldSlug === itemDef.priceFieldSlug)
            || (fieldSlug === itemDef.discountFieldSlug)
            || (fieldSlug === itemDef.taxRateFieldSlug));
  }

  private doCalculation() {

    let sumNetto = 0;
    let sumTaxes = 0;
    let sumDiscount = 0;
    let sumBrutto = 0;
    const taxRates: Map<string, number> = new Map<string, number>();

    let overallDiscountPercent = 0;
    const discountPercentField = this.fieldCollectionService.findByFieldSlug(this.recordAndFields.discountPercentFieldSlug);
    if (discountPercentField) {
      overallDiscountPercent = discountPercentField.getValue();
    }

    this.formInformations.forEach( formInformation => {
      const recordItemSlug = formInformation.recordItemSlug;
      let positionSum = new PositionSum();
      if (formInformation.type === FormType.Service) {
        positionSum = this.calcForRecordItem(recordItemSlug, this.servicePositionItemDef, overallDiscountPercent, FormType.Service);
      } else {
        positionSum = this.calcForRecordItem(recordItemSlug, this.productPositionItemDef, overallDiscountPercent, FormType.Product);
      }
      sumBrutto += positionSum.brutto;
      sumTaxes += positionSum.tax;
      sumDiscount += positionSum.discount;
      sumNetto += positionSum.netto;

      if (taxRates.has(positionSum.taxRateName)) {
        taxRates.set(positionSum.taxRateName, taxRates.get(positionSum.taxRateName) + positionSum.tax);
      } else {
        taxRates.set(positionSum.taxRateName, positionSum.tax);
      }
    });

    this.fieldCollectionService.setFieldValue(this.recordAndFields.discountValueFieldSlug, sumDiscount);
    this.fieldCollectionService.setFieldValue(this.recordAndFields.netTotalFieldSlug, sumNetto);
    this.fieldCollectionService.setFieldValue(this.recordAndFields.totalFieldSlug, sumNetto + sumTaxes);
    this.fieldCollectionService.setFieldValue(this.recordAndFields.taxFieldSlug, this.createTextForTaxRateSumField(taxRates));
  }

  private createTextForTaxRateSumField(taxRates: Map<string, number>) {
    let textTaxes = '';
    let sum = 0;
    taxRates.forEach((taxSum, taxRateName) => {
      textTaxes += taxRateName + ': ' + this.formatCurrency(taxSum) + '\n';
      sum += taxSum;
    });
    textTaxes += '\nTotal: ' + this.formatCurrency(sum);
    return textTaxes;
  }

  private calcForRecordItem(recordItemSlug: string, positionItemDef: CrmPositionItemDef, overallDiscountPercent: number, formType: FormType): PositionSum {
    const amountField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.amountFieldSlug);
    const priceField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.priceFieldSlug);
    const formInformation = this.formInformations.find(fi => fi.recordItemSlug === recordItemSlug);
    const totalField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.totalFieldSlug);
    const taxRateField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.taxRateFieldSlug);
    const taxRateNameField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.taxRateNameFieldSlug);
    const discountField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.discountFieldSlug);
    const totalTaxField = this.fieldCollectionService.findInRecordItem(recordItemSlug, positionItemDef.totalTaxFieldSlug);

    const result: PositionSum = new PositionSum();
    if (amountField && priceField) {

      if ((amountField.getValue() === null) || (isNaN(amountField.getValue() as number))) {
        amountField.setValue(1);
      }
      const price = +this.numberFormatService.formatForInputField(priceField.getValue()) as number;
      let netto = (amountField.getValue() as number) * price;
      if (isNaN(netto)) { netto = 0; }

      let discount = 0;
      if (discountField.getValue() !== '') {
        const discountPercent = + discountField.getValue();
        discount = netto * discountPercent / 100;
        netto = netto - discount;
        const overallDiscount = netto * overallDiscountPercent / 100;
        discount += overallDiscount;
        netto = netto - overallDiscount;
      }

      const taxRate = +taxRateField.getValue();
      const tax = netto * taxRate / 100;
      const brutto = netto + tax;

      totalTaxField.setValue(tax);
      totalField.setValue(brutto);

      formInformation.sum = this.formatCurrency(brutto);

      result.netto = netto;
      result.brutto = brutto;
      result.tax = tax;

      result.taxRateName = taxRateNameField.getValue();
      result.discount = discount;
    }
    return result;
  }

  private async relationFieldItemChangedHook(data: PluginServiceData) {
    const field = data.caller as BaseFieldComponent;

    if (!field || !field.formMetaField || !this.documentSelectorFields || this.documentSelectorFields.length === 0) {
      return;
    }

    if (this.documentSelectorFields.includes(field.formMetaField.slug)) {
      // when the refering document was changed, ask if we should overtake the values
      await this.asyncConfirmationService.confirmYesNo('confirm.please-confirm', 'take-over-data', async () => {
        const recordItem = this.fieldCollectionService.createRecordItemFromComponentValues();
        recordItem.RecordSlug = this.parentRecordSlug;
        recordItem.IsAutoSave = true;
        await this.apiService.postRecordItem(this.fieldCollectionService.mainRecordItemSlug, recordItem);
        await this.pluginService.fire(Hooks.OnReloadActualRecordItem, new PluginServiceData(this));
      });
    }
  }

  private async afterRelationFieldValuesFilledHook(data: PluginServiceData) {
    const relationField = data.caller as RelationFieldComponent;
    const positionRecordItemSlug = relationField.recordItemSlug;  // the position (productItem or serviceItem) slug can be retrieved by the relation field

    let itemDef: CrmItemDef;
    let positionItemDef: CrmPositionItemDef;
    let isProduct = false;

    if ((this.serviceDef) && (relationField.recordItemSlug === this.servicePositionItemDef.itemRecordSlug)) {
      itemDef = this.serviceDef;
      positionItemDef = this.servicePositionItemDef;
    }
    if ((this.productDef) && (relationField.recordSlug === this.productDef.recordSlug)) {
      itemDef = this.productDef;
      positionItemDef = this.productPositionItemDef;
      isProduct = true;
    }

    if (!itemDef) {
      return;
    }

    this.busyService.show();

    // get related item's form data (product or service)
    const relatedFieldFormData = await this.apiService.getRecordFormData(relationField.recordSlug, relationField.getSingleItemIdSelected());

    /**
     * Tax rate
     */

    // find tax rate field
    const taxRateField = relatedFieldFormData.getFormMetaFieldBySlug(itemDef.taxRateFieldSlug);

    // load tax rate record item and get the rate value and title
    const taxRecordItem = await this.apiService.getRecordItem(taxRateField.Value);
    const taxRateValue = taxRecordItem.ItemData.find(id => id.FormFieldSlug === this.taxRateDef.valueFieldSlug).Value;
    const taxRateTitle = taxRecordItem.ItemData.find(id => id.FormFieldSlug === this.taxRateDef.titleFieldSlug).Value;

    // set tax rate in position item
    const taxRateFieldInPosition = this.fieldCollectionService.findInRecordItem(positionRecordItemSlug, positionItemDef.taxRateFieldSlug);
    taxRateFieldInPosition.setValue(taxRateValue);
    // set tax rate name
    const taxRateNameFieldInPosition = this.fieldCollectionService.findInRecordItem(positionRecordItemSlug, positionItemDef.taxRateNameFieldSlug);
    taxRateNameFieldInPosition.setValue(taxRateTitle);

    /**
     * Discount
     */

    // find discount field
    const discountField = relatedFieldFormData.getFormMetaFieldBySlug(itemDef.discountFieldSlug);

    if (discountField.value) {
      // load discount record item
      const discountItem = await this.apiService.getRecordItem(discountField.value);
      const discountPercent = discountItem.ItemData.find(id => id.FormFieldSlug === this.discountDef.percentFieldSlug).Value || 0;
      const discountFieldInPosition = this.fieldCollectionService.findInRecordItem(positionRecordItemSlug, positionItemDef.discountFieldSlug);
      discountFieldInPosition.setValue(discountPercent);
    }

    /**
     * Product price
     */

    // get product price (different for buy or sale)
    if (isProduct) {
      const priceField = relatedFieldFormData.getFormMetaFields().find(f => f.Slug === this.recordAndFields.productPriceFieldSlug);
      if (priceField) {
        this.fieldCollectionService.findInRecordItem(positionRecordItemSlug, positionItemDef.priceFieldSlug).setValue(priceField.value);
      }
    }

    this.busyService.hide();

    this.doCalculation();
  }

  private formatCurrency(num: number): string  {
    let result = (Math.round(num * 100) / 100).toFixed(2);

    if (this.defaultCurrency.position === 'left') {
      result = this.defaultCurrency.symbol + ' ' + result;
    } else {
      result += ' ' + this.defaultCurrency.symbol;
    }

    return result;
  }
}
