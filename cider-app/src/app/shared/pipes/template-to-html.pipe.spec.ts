import { DomSanitizer } from '@angular/platform-browser';
import { HandlebarsPipe } from './handlebars.pipe';
import { CardToHtmlPipe } from './template-to-html.pipe';

describe('TemplateToHtmlPipe', () => {
  it('create an instance', () => {
    const pipe = new CardToHtmlPipe({} as DomSanitizer, {} as HandlebarsPipe);
    expect(pipe).toBeTruthy();
  });
});
