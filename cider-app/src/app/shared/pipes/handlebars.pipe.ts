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
     * Resolves the asset URL from the provided path (dot notation support)
     */
    const resolveAsset = (rootAssets: any, path: string): string => {
      if (!rootAssets || !path) return '';
      // Try direct access first (legacy/flat) - normalize to kebab case for key
      const flatKey = StringUtils.toKebabCase(path);
      if (rootAssets[flatKey] && typeof rootAssets[flatKey] === 'string') {
        return rootAssets[flatKey];
      }

      // Try nested access
      const parts = path.split('.');
      let current = rootAssets;
      for (const part of parts) {
        const key = StringUtils.toKebabCase(part);
        if (current && current[key]) {
          current = current[key];
        } else {
          return '';
        }
      }
      return (typeof current === 'string') ? current : '';
    };

    /**
     * {{index assets card.image}}
     */
    Handlebars.registerHelper('index', function (array, value) {
      if (!array || !value) {
        return '';
      }
      // If array is the assets object, use resolveAsset
      // But 'index' helper is generic. 
      // If we want to support nested assets lookups specifically here:
      if (value.includes('.')) {
        // It might be a path.
        // array[value] won't work.
        // We can try to manually traverse if 'array' looks like our assets object?
        // For now, let's keep index generic, but maybe specialized for string keys?
        // If the user uses {{index assets 'icons.fire'}}, array is assets.
        // Does resolving 'icons.fire' work?
        // Let's implement traversal here too or reuse logic if we could.
        // Inline traversal:
        const parts = value.split('.');
        let current = array;
        for (const part of parts) {
          current = current[StringUtils.toKebabCase(part)];
          if (!current) return undefined;
        }
        return current;
      }
      return array[StringUtils.toKebabCase(value)];
    });

    const compile = function (value: any, options: any): any {
      if (!value) {
        return value;
      }
      return new Handlebars.SafeString(value.replace(/[{][{]([^} ]*)( [0-9]+)?[}][}]/g,
        (match: boolean, assetPath: string, count: string) => {
          const assetUrl = resolveAsset(options.data.root.assets, assetPath);
          const image = `<img src="${assetUrl}" ${options.hash['width'] ? 'width=' + options.hash['width'] : ''}/>`;
          const multiplier = parseInt(count);
          return !assetUrl ? '' : multiplier ? image.repeat(multiplier) : image;
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
    Handlebars.registerHelper('repeat', function (count, options) {
      var accum = '';
      for (var i = 0; i < count; i++)
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
    Handlebars.registerHelper('and', function (a, b) {
      return a && b;
    });

    /**
     * {{#if (and (eq card.type "mystic") (gt card.power 4))}}
     * {{/if}}
     */
    Handlebars.registerHelper('or', function (a, b) {
      return a || b;
    });

    /***********************************
     * Comparison Helpers
     ***********************************/

    /**
     * {{eq card.type 'mystic'}}
     */
    Handlebars.registerHelper('eq', function (a, b) {
      return a == b;
    });
    /**
     * {{gt card.type 'mystic'}}
     */
    Handlebars.registerHelper('gt', function (a, b) {
      return a > b;
    });
    /**
     * {{gte card.type 'mystic'}}
     */
    Handlebars.registerHelper('gte', function (a, b) {
      return a >= b;
    });
    /**
     * {{lt card.type 'mystic'}}
     */
    Handlebars.registerHelper('lt', function (a, b) {
      return a < b;
    });
    /**
     * {{lte card.type 'mystic'}}
     */
    Handlebars.registerHelper('lte', function (a, b) {
      return a <= b;
    });

    /***********************************
     * String Helpers
     ***********************************/

    /**
     * {{concat card.type '-experience'}}
     */
    Handlebars.registerHelper('concat', function (a, b) {
      return '' + a + b;
    });

    /**
     * {{kebabcase 'Clear Orb'}}
     */
    Handlebars.registerHelper('kebabcase', function (a) {
      return ('' + a).trim().replace(/ /g, '-').toLowerCase();
    });

    /**
     * {{upercase 'Clear Orb'}}
     */
    Handlebars.registerHelper('uppercase', function (a) {
      return ('' + a).toUpperCase();
    });

    /**
     * {{lowercase 'Clear Orb'}}
     */
    Handlebars.registerHelper('lowercase', function (a) {
      return ('' + a).toLowerCase();
    });

    /**
     * {{padZeros card.id 4}}
     */
    Handlebars.registerHelper('padZeros', function (value, numZeros) {
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
    Handlebars.registerHelper('add', function (a, b) {
      return Number.parseFloat(a) + Number.parseFloat(b);
    });
    /**
     * {{sub card.power 2}}
     */
    Handlebars.registerHelper('sub', function (a, b) {
      return Number.parseFloat(a) - Number.parseFloat(b);
    });
    /**
     * {{multiply card.power 2}}
     */
    Handlebars.registerHelper('multiply', function (a, b) {
      return Number.parseFloat(a) * Number.parseFloat(b);
    });
    /**
     * {{divide card.power 2}}
     */
    Handlebars.registerHelper('divide', function (a, b) {
      return Number.parseFloat(a) / Number.parseFloat(b);
    });
    /**
     * {{ceil card.power 2}}
     */
    Handlebars.registerHelper('ceil', function (a) {
      return Math.ceil(a);
    });
    /**
     * {{floor card.power 2}}
     */
    Handlebars.registerHelper('floor', function (a) {
      return Math.floor(a);
    });
    /**
     * {{abs card.power 2}}
     */
    Handlebars.registerHelper('abs', function (a) {
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
      return template({ assets: assetUrls });
    } catch (error) {
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
