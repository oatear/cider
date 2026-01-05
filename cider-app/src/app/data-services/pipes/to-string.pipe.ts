import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'toString',
    standalone: false
})
export class ToStringPipe implements PipeTransform {

  transform(value: any): string {
    return String(value);
  }

}
