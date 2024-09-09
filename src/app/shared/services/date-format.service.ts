import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  constructor() { }

  private phpTokens = {
    d: 'dd',    // Day of the month, 2 digits with leading zeros
    j: 'd',     // Day of the month without leading zeros
    D: 'D',     // A textual representation of a day, three letters
    l: 'DD',    // A full textual representation of the day of the week
    m: 'mm',    // Numeric representation of a month, with leading zeros
    n: 'm',     // Numeric representation of a month, without leading zeros
    M: 'M',     // A short textual representation of a month, three letters
    F: 'MM',    // A full textual representation of a month, such as January or March
    Y: 'yy',    // A full numeric representation of a year, 4 digits
    y: 'y',     // A two digit representation of a year
    z: 'o'      // The day of the year (starting from 0)
  };

  public php2jsFormatString(phpFormatString: string): string {
    let result = '';

    result = phpFormatString.split('').reduce((acc, c, i, arr) => {
      if (c in this.phpTokens) {
        acc += this.phpTokens[c];
      } else {
        acc += c;
      }
      return acc;
    }, '');

    return result;
  }
}
