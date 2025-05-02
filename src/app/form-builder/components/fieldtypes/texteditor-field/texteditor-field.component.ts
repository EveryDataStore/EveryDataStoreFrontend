import {BaseFieldComponent} from '../base-field/base-field.component';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FieldSettingsChangeService} from 'src/app/form-builder/services/field-settings-change.service';
import {CKEditorComponent} from '@ckeditor/ckeditor5-angular';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import {EventEmitterService} from '../../../services/event-emitter.service';

@Component({
    selector: 'app-texteditor-field',
    templateUrl: './texteditor-field.component.html',
    styleUrls: ['./texteditor-field.component.scss'],
})
export class TexteditorFieldComponent extends BaseFieldComponent implements OnInit {
    value = '';
    public Editor = ClassicEditor;
    public config = {
        toolbar: [
            'heading',
            'sourceCode',
            'redo',
            'bold',
            'italic',
            'blockQuote',
            'ckfinder',
            'link',
            'numberedList',
            'bulletedList',
            'mediaEmbed',
            'insertTable',
            'tableColumn',
            'tableRow',
            'mergeTableCells',
        ],
    };

    @ViewChild('editor') editor: CKEditorComponent;

    constructor(
        private fieldSettingsChangeService: FieldSettingsChangeService,
        private eventEmitterService: EventEmitterService
    ) {
        super();
        this.fieldSettingsChangeService.listen().subscribe((_) => {
            this.setSettingOptions();
        });
    }

    ngOnInit() {
        super.ngOnInit();
        this.setSettingOptions();
        this.eventEmitterService.invokeFirstComponentFunction.subscribe((data: string) => {
            this.firstFunction(data);
        });
    }

    setSettingOptions() {
        super.setDefaultValue();
    }

    getValue() {
        return this.value;
    }

    setValue(value) {
        this.value = value;
    }

    firstFunction(fieldName: string) {
        const appendData = '{{' + fieldName + '}}';
        const selection = this.editor.editorInstance.model.document.selection;
        const range = selection.getFirstRange();
        this.editor.editorInstance.model.change((writer) => {
            // writer.insert(appendData, range.start);
        });
    }
}
