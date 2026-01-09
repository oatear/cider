import { DomSanitizer } from '@angular/platform-browser';
import { FileUrlPipe } from './file-url.pipe';

describe('FileUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new FileUrlPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
