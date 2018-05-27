import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getValues' })
export class GetValuesPipe implements PipeTransform {
    transform(value, args: string[]): any {
        const keys = [];
        for (const key of value) {
            keys.push({ key: key, value: value[key] });        }
        return keys;
    }
}
