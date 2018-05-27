import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'RegExFilterPipe',
})
export class RegExFilterPipe implements PipeTransform {

  transform(value: any, input: any) {
        if (input) {
            input = input.toLowerCase();
              return value.filter(obj => (obj.expression.toLowerCase().indexOf(input) !== -1));
        }
        return value;
    }




}
