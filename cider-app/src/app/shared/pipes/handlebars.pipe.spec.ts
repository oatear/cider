import { DomSanitizer } from '@angular/platform-browser';
import { HandlebarsPipe } from './handlebars.pipe';

describe('HandlebarsPipe', () => {
  it('create an instance', () => {
    const pipe = new HandlebarsPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
