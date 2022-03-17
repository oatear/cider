import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as Handlebars from 'handlebars';
import { CardTemplate } from 'src/app/data-services/types/card-template.type';
import { Card } from 'src/app/data-services/types/card.type';
import StringUtils from '../utils/string-utils';

/**
 * Convert a card template into html
 */
@Pipe({
  name: 'cardToHtml',
  pure: false
})
export class CardToHtmlPipe implements PipeTransform {
  
  constructor(private domSanitizer: DomSanitizer) {
    let self = this;

    /**
     * {{#repeat 10}}
     *    <span>{{this}}</span>
     * {{/repeat}}
     */
    Handlebars.registerHelper('repeat', function(count, options) {
        var accum = '';
        for(var i = 0; i < count; i++)
            accum += options.fn(options.data.root);
        return accum;
    });
    /**
     * {{index assets card.image}}
     */
    Handlebars.registerHelper('index', function(array, value) {
      if (!array || !value) {
        return '';
      }
      return array[StringUtils.toKebabCase(value)];
    });
    /**
     * {{padZeros card.id 4}}
     */
    Handlebars.registerHelper('padZeros', function(value, numZeros) {
      if (!value || !numZeros) {
        return ''.padStart(numZeros, '0');
      }
      return (value + '').padStart(numZeros, '0');
    });
    /**
     * {{compileImages card.description width=100}}
     * 
     * card.description: 'Convert two {{apple}} into one {{chip}}'
     * card.description: 'Convert {{apple 2}} into {{chip}}'
     */
    Handlebars.registerHelper('compileImages', function(value, options) {
      if (!value) {
        return value;
      }
      return new Handlebars.SafeString(value.replace(/[{][{]([^} ]*)( [0-9]+)?[}][}]/g, 
        (match: boolean, p1: string, p2: string) => {
          const image = `<img src="${options.data.root.assets[p1]}" ${options.hash['width'] ? 'width=' + options.hash['width'] : ''}/>`;
          const multiplier = parseInt(p2);
          return multiplier ? image.repeat(multiplier) : image;
        }));
    });
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

