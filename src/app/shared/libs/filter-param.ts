export class FilterParam {

    private parts: Map<string, string> = new Map();

    public constructor() {
        return this;
    }

    public addValue(name: string, value: string) {
        this.parts.set(name, value);
        return this;
    }

    public addNumberValue(name: string, value: number) {
        this.parts.set(name, value.toString());
        return this;
    }

    public addValues(name: string, values: string[]) {
        values = values ? [].concat(values) : [];   // convert to array if its not yet one
        this.parts.set(name, '{' + values.join(';') + '}');
        return this;
    }

    public addRecordItemSlug(recordItemSlug: string) {
        this.addValue('RecordItem.Slug', recordItemSlug);
        return this;
    }

    public addRecordSlug(recordSlug: string) {
        this.addValue('RecordSet.Slug', recordSlug);
        return this;
    }

    public addFormFieldSlug(formFieldSlug: string) {
        this.addValue('FormField.Slug', formFieldSlug);
        return this;
    }

    public hasContent(): boolean {
        return (this.parts.size > 0);
    }

    public toString(): string {
        if (this.parts.size === 0) {
            return '';
        }

        const stringParts: string[] = [];
        this.parts.forEach((val: string, key: string) => {
            stringParts.push(key + '=' + val);
        });

        return '{' + stringParts.join(',') + '}';
    }
}
