import {TestBed} from '@angular/core/testing';

import {DateTimeFormatService} from './date-time-format.service';

describe('DateFormatService', () => {
    let service: DateTimeFormatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DateTimeFormatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
