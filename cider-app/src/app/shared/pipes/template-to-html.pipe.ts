import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Asset } from 'src/app/data-services/types/asset.type';
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

  transform(card: Card, template: CardTemplate, assets?: Asset[]): SafeHtml {
    if (!card || !template) {
      return '';
    }
    console.log('cardToHtml: ', card, template);
    return this.safeHtmlAndStyle(card, 
      this.injectVariables(card, template.html, assets), 
      this.injectVariables(card, template.css, assets));
  }

  private injectVariables(card: Card, text: string, assets?: Asset[]) {
    if (!card || !text) {
      return text;
    }
    let injectedText = text;
    if (assets) {
      // text.replace(/\{\{asset:([^}]+)\}\}/g, (match, p1) => await this.assetsService.getByName(p1));
      injectedText = injectedText.replace(/\{\{asset:([^}]+)\}\}/g, (match, p1) => this.assetToUrl(this.getAssetByName(assets, p1)));
    }
    return injectedText.replace(/\{\{([^}]+)\}\}/g, (match, p1) => (<any>card)[p1]);
  }

  private getAssetByName(assets: Asset[], name: string): Asset {
    if (!assets || !name) {
      return {} as Asset;
    }
    let filteredAssets = assets.filter(asset => asset.name && asset.name.replace(/ /g, '').toLowerCase() === name);
    return filteredAssets && filteredAssets.length > 0 ? filteredAssets[0] : {} as Asset;
  }

  private assetToUrl(asset: Asset): string {
    if (!asset.file) {
      return '';
    }
    return URL.createObjectURL(asset.file);
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
