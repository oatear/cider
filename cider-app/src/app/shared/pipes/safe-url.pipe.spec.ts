import { DomSanitizer } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeUrlPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
