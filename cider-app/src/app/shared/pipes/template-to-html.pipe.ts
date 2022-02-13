import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CardTemplate } from 'src/app/data-services/types/card-template.type';
import { Card } from 'src/app/data-services/types/card.type';

/**
 * Convert a card template into html
 */
@Pipe({
  name: 'cardToHtml',
  pure: false
})
export class CardToHtmlPipe implements PipeTransform {
  
  constructor(private domSanitizer: DomSanitizer) {
  }

  transform(card: Card, template: CardTemplate): SafeHtml {
    if (!card || !template) {
      return '';
    }
    return this.safeHtmlAndStyle(card, 
      this.injectVariables(card, template.html), 
      this.injectVariables(card, template.css));
  }

  private injectVariables(card: Card, text: string) {
    if (!card || !text) {
      return text;
    }
    return text.replace(/\{\{([^}]+)\}\}/g, (match, p1) => (<any>card)[p1]);
  }

  private safeHtmlAndStyle(card: Card, html: string, css: string): SafeHtml {
    if (!html || !css) {
      return '';
    }
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, `.card-preview.card-${card.id} $1`).replace(/\!important/g, '');
    let safeStyle = this.domSanitizer.sanitize(SecurityContext.STYLE, sanitizedStyle);
    let safeHtml = this.domSanitizer.sanitize(SecurityContext.HTML, html);
    return this.domSanitizer.bypassSecurityTrustHtml(`${safeHtml}<style>${safeStyle}</style>`);
  }

}
