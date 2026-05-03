import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CardTemplate } from 'src/app/data-services/types/card-template.type';
import { Card } from 'src/app/data-services/types/card.type';
import * as Handlebars from 'handlebars';

/**
 * Convert a card template into html
 */
@Pipe({
  name: 'cardToHtml',
  pure: true,
  standalone: false
})
export class CardToHtmlPipe implements PipeTransform {
  private static compiledTemplates = new Map<string, Handlebars.TemplateDelegate>();
  private static readonly MAX_CACHE_SIZE = 500;

  constructor(private domSanitizer: DomSanitizer) { }

  transform(template: CardTemplate, card: Card, assetUrls?: any, uuid?: string, version?: number): SafeHtml {

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

    let template = CardToHtmlPipe.compiledTemplates.get(htmlTemplate);
    if (!template) {
      if (CardToHtmlPipe.compiledTemplates.size >= CardToHtmlPipe.MAX_CACHE_SIZE) {
        CardToHtmlPipe.compiledTemplates.clear();
      }
      template = Handlebars.compile(htmlTemplate);
      CardToHtmlPipe.compiledTemplates.set(htmlTemplate, template);
    }


    try {
      return template({ card: card, assets: assetUrls });
    } catch (error) {
      return '';
    }
  }

  private safeHtmlAndStyle(card: Card, html: string, css: string, uuid?: string): SafeHtml {
    if (!html || !css) {
      return '';
    }
    let sanitizedStyle = css.replace(/([^{}]*\{)/g, `.card-preview.card-${uuid} $1`)
      .replace(/\!important/g, '');
    return this.domSanitizer.bypassSecurityTrustHtml(`${html}<style>${sanitizedStyle}</style>`);
  }
}
