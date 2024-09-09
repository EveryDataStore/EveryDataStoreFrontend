import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberFormatService {

  constructor() { }

  /**
   * Format a number value we get back to how its needed for input fields
   */
  public formatForInputField(value): string {
    // remove all non numeric chars except ,.-
    let tmp = String(value).replace(/[^\d.,-]/g, '');

    tmp = tmp.replace(',', '.');
    const parts = tmp.split('.');
    const last = parts.pop();
    const result = (parts.length ? parts.join('') + '.' + last : last);
    return result;
  }
}
