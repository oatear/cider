import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import StringUtils from '../utils/string-utils';
import * as Handlebars from 'handlebars';

@Pipe({
    name: 'handlebars',
    standalone: false
})
export class HandlebarsPipe implements PipeTransform {

  constructor(domSanitizer: DomSanitizer) {
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

  transform(handlebars: string, assetUrls?: any): string {
    return this.sanitizeCss(this.executeHandlebars(handlebars, assetUrls));
  }
  
  private executeHandlebars(handlebars: string, assetUrls?: any): string {
    if (!handlebars) {
      return '';
    }
    let template = Handlebars.compile(handlebars);
    try {
      return template({assets: assetUrls});
    } catch(error) {
      return '';
    }
  }

  private sanitizeCss(css: string): string {
    if (!css) {
      return '';
    }
    return css.replace(/\!important/g, '');
  }

}
