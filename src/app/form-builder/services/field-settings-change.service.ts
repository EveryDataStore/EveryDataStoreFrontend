import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class FieldSettingsChangeService {
    public changeSubject: Subject<boolean>;

    constructor() {
        this.changeSubject = new Subject<boolean>();
    }

    listen() {
        return this.changeSubject;
    }

    onChange() {
        this.changeSubject.next(true);
    }
}
