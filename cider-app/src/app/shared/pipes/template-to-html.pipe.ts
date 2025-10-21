import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CardTemplate } from 'src/app/data-services/types/card-template.type';
import { Card } from 'src/app/data-services/types/card.type';
import { HandlebarsPipe } from './handlebars.pipe';
import * as Handlebars from 'handlebars';

/**
 * Convert a card template into html
 */
@Pipe({
  name: 'cardToHtml',
  pure: false
})
export class CardToHtmlPipe implements PipeTransform {
  
  constructor(private domSanitizer: DomSanitizer,
    handlebarsPipe: HandlebarsPipe
  ) {
    let self = this;
  }

  transform(template: CardTemplate, card: Card, assetUrls?: any, uuid?: string): SafeHtml {
    if (!template || !card) {
      return '';
    }
    return this.safeHtmlAndStyle(card, 
      this.executeHandlebars(template.html, card, assetUrls), 
      this.executeHandlebars(template.css, card, assetUrls),
      uuid);
  }

  private executeHandlebars(htmlTemplate: string, card: Card, assetUrls?: any): string {
    if (!htmlTemplate) {
      return '';
    }
    let template = Handlebars.compile(htmlTemplate);
    try {
      return template({card: card, assets: assetUrls});
    } catch(error) {
      return '';
    }
  }

  private safeHtmlAndStyle(card: Card, html: string, css: string, uuid?: string): SafeHtml {
    if (!html || !css) {
      return '';
    }
    let cardId = card?.id ? card?.id : 0;
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, `.card-preview.card-${uuid} $1`)
      .replace(/\!important/g, '');
    let safeStyle = this.domSanitizer.sanitize(SecurityContext.STYLE, sanitizedStyle);
    // let safeHtml = this.domSanitizer.sanitize(SecurityContext.HTML, html);
    let safeHtml = html;
    return this.domSanitizer.bypassSecurityTrustHtml(`${safeHtml}<style>${safeStyle}</style>`);
  }

}

