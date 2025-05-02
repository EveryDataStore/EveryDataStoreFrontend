import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DateTimeFormatService {
    private phpTokensPrimeng = {
        d: 'dd', // Day of the month, 2 digits with leading zeros
        j: 'd', // Day of the month without leading zeros
        D: 'D', // A textual representation of a day, three letters
        l: 'DD', // A full textual representation of the day of the week
        m: 'mm', // Numeric representation of a month, with leading zeros
        n: 'm', // Numeric representation of a month, without leading zeros
        M: 'M', // A short textual representation of a month, three letters
        F: 'MM', // A full textual representation of a month, such as January or March
        Y: 'yy', // A full numeric representation of a year, 4 digits
        y: 'y', // A two digit representation of a year
        z: 'o', // The day of the year (starting from 0)
    };

    private phpTokensDateFns = {
        d: 'dd', // Day of the month, 2 digits with leading zeros
        j: 'd', // Day of the month without leading zeros
        D: 'EEE', // A textual representation of a day, three letters
        l: 'EEEE', // A full textual representation of the day of the week
        m: 'MM', // Numeric representation of a month, with leading zeros
        n: 'M', // Numeric representation of a month, without leading zeros
        M: 'MMM', // A short textual representation of a month, three letters
        F: 'MMMM', // A full textual representation of a month, such as January or March
        Y: 'yyyy', // A full numeric representation of a year, 4 digits
        y: 'yy', // A two digit representation of a year
        z: 'D', // The day of the year (starting from 0)
    };

    public php2jsFormatStringForPrimeNg(phpFormatString: string) {
        return this.createFormatStringWithPhpTokens(phpFormatString, this.phpTokensPrimeng);
    }

    public php2jsFormatStringForDateFsn(phpFormatString: string) {
        return this.createFormatStringWithPhpTokens(phpFormatString, this.phpTokensDateFns);
    }

    public timeFormatStringForDateFsn(is12HourFormat: boolean, showSeconds: boolean) {
        let formatString = is12HourFormat ? 'hh' : 'HH';
        formatString += ':mm';
        if (showSeconds) {
            formatString += ':ss';
        }
        if (is12HourFormat) {
            formatString += ' aa';
        }
        return formatString;
    }

    /**
     * Convert time string from backend to a time string the primeng calendar understands
     * This is specially needed when the user changed the format of the time field later on
     * e.g. when the user changes to show seconds = true, and the value from backend does not have the seconds,
     * the calendar component would give an error
     *
     */
    public formatTimeValue(timeString: string, is12HourFormat: boolean, showSeconds: boolean): string {
        if (!timeString) {
            return timeString;
        }

        let result: string;
        const partsDelimiter = ':';

        const regex = /([0-9\:]*)[ ]?(AM|PM)?/;
        const matches = timeString.match(regex);
        const timePart = matches[1] ? matches[1] : timeString; // timePart is the time only, without AM or PM
        const amOrPm = matches[2]; // matches[2] can be 'AM' or 'PM', if present

        result = timePart;
        if (!showSeconds) {
            if (timePart.indexOf(partsDelimiter) !== timePart.lastIndexOf(partsDelimiter)) {
                result = timePart.substr(0, timePart.lastIndexOf(partsDelimiter));
            }
        } else {
            if (timePart.length === 5) {
                result = timePart + ':00';
            }
        }

        // tslint:disable-next-line: radix
        const hour = parseInt(timePart.substr(0, 2));

        if (amOrPm) {
            if (is12HourFormat) {
                // 12 hour format
                result += ' ' + amOrPm;
            } else {
                // 24 hour format
                if (amOrPm === 'PM') {
                    if (hour < 12) {
                        result = this.changeHourInTimeString(result, hour + 12, partsDelimiter);
                    }
                } else {
                    if (hour === 12) {
                        result = this.changeHourInTimeString(result, hour - 12, partsDelimiter); // e.g. 12:00 AM === 00:00
                    }
                }
            }
        } else {
            // we dont have an 'AM' or 'PM' in string
            if (is12HourFormat) {
                if (hour < 12) {
                    if (hour < 1) {
                        result = this.changeHourInTimeString(result, hour + 12, partsDelimiter);
                    }
                    result += ' AM';
                } else {
                    if (hour >= 13) {
                        result = this.changeHourInTimeString(result, hour - 12, partsDelimiter);
                    }
                    result += ' PM';
                }
            }
        }
        return result;
    }

    private changeHourInTimeString(timeString: string, newHour: number, partsDelimiter: string): string {
        return newHour + timeString.substr(timeString.indexOf(partsDelimiter));
    }

    private createFormatStringWithPhpTokens(phpFormatString: string, phpTokens): string {
        let result = '';

        result = phpFormatString.split('').reduce((acc, c, i, arr) => {
            if (c in phpTokens) {
                acc += phpTokens[c];
            } else {
                acc += c;
            }
            return acc;
        }, '');

        return result;
    }
}
