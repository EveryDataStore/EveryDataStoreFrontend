export interface CrmRecordAndFields {
  recordSlug: string;
  discountPercentFieldSlug: string;
  discountValueFieldSlug: string;
  taxFieldSlug: string;
  netTotalFieldSlug: string;
  totalFieldSlug: string;
  productPriceFieldSlug: string;
  addItemButtonsAvailable: string[];
}

// all field slugs from a crm item position, can be crm_product_item or crm_service_item
export interface CrmPositionItemDef {
  recordSlug: string;
  itemFieldSlug: string;          // the product or service item relation field
  amountFieldSlug: string;
  priceFieldSlug: string;
  discountFieldSlug: string;
  nameFieldSlug: string;
  totalFieldSlug: string;
  descriptionFieldSlug: string;
  taxRateFieldSlug: string;
  taxRateNameFieldSlug: string;
  totalTaxFieldSlug: string;  
  unitFieldSlug: string;
  itemRecordSlug: string;
  itemStockFieldSlug: string;  
}

export interface CrmDefaultCurrency {
  name: string;
  symbol: string;
  position: string;
}

  // all needed field slug from an item which is refered in the position, can be crm_products or crm_services
export interface CrmItemDef {
  recordSlug: string;
  taxRateFieldSlug: string;
  discountFieldSlug: string;
}

export interface CrmTaxRateDef {
  titleFieldSlug: string;
  valueFieldSlug: string;
}

export interface CrmDiscountDef {
  percentFieldSlug: string;
}