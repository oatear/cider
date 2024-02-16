import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ENGINE_METHOD_PKEY_ASN1_METHS } from 'constants';
import * as Handlebars from 'handlebars';
import { CardTemplate } from 'src/app/data-services/types/card-template.type';
import { Card } from 'src/app/data-services/types/card.type';
import StringUtils from '../utils/string-utils';
import { Variable, VariableCollection } from '../../data-services/types/variable.type';

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

    /***********************************
     * Basic Helpers
     ***********************************/

    /**
     * {{index assets card.image}}
     */
    Handlebars.registerHelper('index', function(array, value) {
      if (!array || !value) {
        return '';
      }
      return array[StringUtils.toKebabCase(value)];
    });

    const compile = function(value: any, options: any): any {
      if (!value) {
        return value;
      }
      return new Handlebars.SafeString(value.replace(/[{][{]([^} ]*)( [0-9]+)?[}][}]/g, 
        (match: boolean, asset: string, count: string) => {
          const image = `<img src="${options.data.root.assets[asset]}" ${options.hash['width'] ? 'width=' + options.hash['width'] : ''}/>`;
          const multiplier = parseInt(count);
          return !options.data.root.assets[asset] ? '' : multiplier ? image.repeat(multiplier) : image;
        }));
    }

    /**
     * {{compileImages card.description width=100}}
     * {{compile card.description width=100}}
     * 
     * card.description: 'Convert two {{apple}} into one {{chip}}'
     * card.description: 'Convert {{apple 2}} into {{chip}}'
     */
    Handlebars.registerHelper('compileImages', compile);
    Handlebars.registerHelper('compile', compile);
    
    /***********************************
     * Control Helpers
     ***********************************/

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

    /***********************************
     * Boolean Helpers
     ***********************************/
    
    /**
     * {{#if (and (eq card.type "mystic") (gt card.power 4))}}
     * {{/if}}
     */
     Handlebars.registerHelper('and', function(a, b) {
      return a && b;
    });

    /**
     * {{#if (and (eq card.type "mystic") (gt card.power 4))}}
     * {{/if}}
     */
     Handlebars.registerHelper('or', function(a, b) {
      return a || b;
    });

    /***********************************
     * Comparison Helpers
     ***********************************/
    
    /**
     * {{eq card.type 'mystic'}}
     */
     Handlebars.registerHelper('eq', function(a, b) {
      return a == b;
    });
    /**
     * {{gt card.type 'mystic'}}
     */
     Handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });
    /**
     * {{gte card.type 'mystic'}}
     */
     Handlebars.registerHelper('gte', function(a, b) {
      return a >= b;
    });
    /**
     * {{lt card.type 'mystic'}}
     */
     Handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });
    /**
     * {{lte card.type 'mystic'}}
     */
     Handlebars.registerHelper('lte', function(a, b) {
      return a <= b;
    });
    
    /***********************************
     * String Helpers
     ***********************************/

    /**
     * {{concat card.type '-experience'}}
     */
     Handlebars.registerHelper('concat', function(a, b) {
      return '' + a + b;
    });

    /**
     * {{kebabcase 'Clear Orb'}}
     */
     Handlebars.registerHelper('kebabcase', function(a) {
      return ('' + a).trim().replace(/ /g, '-').toLowerCase();
    });

    /**
     * {{upercase 'Clear Orb'}}
     */
     Handlebars.registerHelper('uppercase', function(a) {
      return ('' + a).toUpperCase();
    });

    /**
     * {{lowercase 'Clear Orb'}}
     */
     Handlebars.registerHelper('lowercase', function(a) {
      return ('' + a).toLowerCase();
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
    
    /***********************************
     * Math Helpers
     ***********************************/

    /**
     * {{add card.power 2}}
     */
     Handlebars.registerHelper('add', function(a, b) {
      return Number.parseFloat(a) + Number.parseFloat(b);
    });
    /**
     * {{sub card.power 2}}
     */
     Handlebars.registerHelper('sub', function(a, b) {
      return Number.parseFloat(a) - Number.parseFloat(b);
    });
    /**
     * {{multiply card.power 2}}
     */
     Handlebars.registerHelper('multiply', function(a, b) {
      return Number.parseFloat(a) * Number.parseFloat(b);
    });
    /**
     * {{divide card.power 2}}
     */
     Handlebars.registerHelper('divide', function(a, b) {
      return Number.parseFloat(a) / Number.parseFloat(b);
    });
    /**
     * {{ceil card.power 2}}
     */
     Handlebars.registerHelper('ceil', function(a) {
      return Math.ceil(a);
    });
    /**
     * {{floor card.power 2}}
     */
     Handlebars.registerHelper('floor', function(a) {
      return Math.floor(a);
    });
    /**
     * {{abs card.power 2}}
     */
     Handlebars.registerHelper('abs', function(a) {
      return Math.abs(a);
    });

  }

  transform(template: CardTemplate, card: Card, assetUrls?: any, uuid?: string, variables?: VariableCollection): SafeHtml {
    if (!template || !card) {
      return '';
    }

    return this.safeHtmlAndStyle(card, 
      this.executeHandlebars(template.html, card, assetUrls, variables), 
      this.executeHandlebars(template.css, card, assetUrls, variables),
      uuid);
  }

  private executeHandlebars(htmlTemplate: string, card: Card, assetUrls?: any, variables?: VariableCollection): string {
    if (!htmlTemplate) {
      return '';
    }
    let template = Handlebars.compile(htmlTemplate);
    try {
      return template({card: card, assets: assetUrls, variables });
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

