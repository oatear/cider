import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Create an object url from file
 */
@Pipe({
  name: 'fileUrl'
})
export class FileUrlPipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) {

  }

  transform(file: File): SafeResourceUrl {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(file));
  }

}
