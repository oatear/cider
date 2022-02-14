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
     * {{#indexOf assets cards.image}}
     */
    Handlebars.registerHelper('index', function(array, value) {
      return array[value];
    });
  }

  transform(template: CardTemplate, card: Card, assetUrls?: any): SafeHtml {
    if (!template ||!card) {
      return '';
    }
    // console.log('cardToHtml: ', card, template, assetUrls);
    return this.safeHtmlAndStyle(card, 
      this.executeHandlebars(template.html, card, assetUrls), 
      this.executeHandlebars(template.css, card, assetUrls));
  }

  private executeHandlebars(htmlTemplate: string, card: Card, assetUrls?: any): string {
    if (!htmlTemplate) {
      return '';
    }
    let template = Handlebars.compile(htmlTemplate);
    return template({card: card, assets: assetUrls});
  }

  private safeHtmlAndStyle(card: Card, html: string, css: string): SafeHtml {
    if (!html || !css) {
      return '';
    }
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, `.card-preview.card-${card.id} $1`).replace(/\!important/g, '');
    let safeStyle = this.domSanitizer.sanitize(SecurityContext.STYLE, sanitizedStyle);
    // let safeHtml = this.domSanitizer.sanitize(SecurityContext.HTML, html);
    let safeHtml = html;
    return this.domSanitizer.bypassSecurityTrustHtml(`${safeHtml}<style>${safeStyle}</style>`);
  }

}
