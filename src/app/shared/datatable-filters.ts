import { DatePipe } from '@angular/common';

export class DatatableFilters {

  public static filterHasContent = (value, filter: any): boolean => {
    if (filter === null) {
      return true;
    }
    if (filter && typeof value !== 'undefined' && value !== null) {
      if (value.toString().trim() !== '') {
        return true;
      }
    }
    if (!filter) {
      if (typeof value === 'undefined' || value === null) {
        return true;
      } else {
        if (value.toString().trim() === '') {
          return true;
        }
      }
    }

    return false;
    // tslint:disable-next-line:semicolon
  };

  public static filterEqualDate = (value: any, filter: Date): boolean => {
    const getDateString = function (date: Date) {
      return date.getFullYear() + '-'
        + (date.getMonth() + 1).toString().padStart(2, '0') + '-'
        + date.getDate().toString().padStart(2, '0');
    };
    if (filter === null) {
      return true;
    }

    if (value !== null) {
      const filterDateString: string = getDateString(filter);
      const valueDateString: string = getDateString(new Date(value as string));

      if (valueDateString === filterDateString) {
        return true;
      }
    }
    return false;
  };

  public static filterDebug = (value, filter: any): boolean => {
    return true;
  };
}
