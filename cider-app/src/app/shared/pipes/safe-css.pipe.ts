import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Pipe({
  name: 'safeCss'
})
export class SafeCssPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(value);
  }

}
