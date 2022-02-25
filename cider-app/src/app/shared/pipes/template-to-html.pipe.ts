import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as Handlebars from 'handlebars';
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

    /**
     * {{#repeat 10}}
     *    <span>{{this}}</span>
     * {{/repeat}}
     */
    Handlebars.registerHelper('repeat', function(n, block) {
        var accum = '';
        for(var i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });
    /**
     * {{#index assets card.image}}{{/index}}
     */
    Handlebars.registerHelper('index', function(array, value) {
      if (!array || !value) {
        return '';
      }
      return array[value];
    });
    /**
     * {{#padZeros card.id 4}}{{/padZeros}}
     */
    Handlebars.registerHelper('padZeros', function(value, numZeros) {
      if (!value || !numZeros) {
        return ''.padStart(numZeros, '0');
      }
      return (value + '').padStart(numZeros, '0');
    });
  }

  transform(template: CardTemplate, card: Card, assetUrls?: any, uuid?: string): SafeHtml {
    if (!template || !card) {
      return '';
    }
    // console.log('cardToHtml: ', card, template, assetUrls);
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
