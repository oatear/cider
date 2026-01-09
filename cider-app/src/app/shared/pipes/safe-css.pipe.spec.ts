import { DomSanitizer } from '@angular/platform-browser';
import { SafeCssPipe } from './safe-css.pipe';

describe('SafeCssPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeCssPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
