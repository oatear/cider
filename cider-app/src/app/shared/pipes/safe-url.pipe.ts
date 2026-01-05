import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeUrl',
    standalone: false
})
export class SafeUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
  }

  transform(url: string | undefined): SafeUrl {
    if (!url) {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
