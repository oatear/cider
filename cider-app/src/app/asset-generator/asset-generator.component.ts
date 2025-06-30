import { Component } from '@angular/core';
import { generateRandomCardSymbol } from '../shared/generators/card-symbol-generator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { generateRandomCardBackground } from '../shared/generators/card-background-generator';

interface AssetTypeOption {
  label: string;
  value: 'symbol' | 'badge' | 'art' | 'background' | 'banner' | 'textbox';
}

@Component({
  selector: 'app-asset-generator',
  templateUrl: './asset-generator.component.html',
  styleUrl: './asset-generator.component.scss'
})
export class AssetGeneratorComponent {
  assetOptions: AssetTypeOption[] = [
    { label: 'Symbol', value: 'symbol' }, 
    { label: 'Badge', value: 'badge' }, 
    { label: 'Art', value: 'art' },
    { label: 'Background', value: 'background' },
    { label: 'Banner', value: 'banner' },
    { label: 'Textbox', value: 'textbox' },
  ];
  selectedAssetOption: AssetTypeOption = this.assetOptions[0];
  frontColor: string | undefined;
  backColor: string | undefined;
  backgroundColor: string | undefined;
  outlineColor: string | undefined;
  outlineWidth: number = 2;
  imageWidth: number = 64;
  imageHeight: number = 64;
  frontScale: number = 0.7;

  public symbols: SafeHtml[] = [];

  constructor(private sanitizer: DomSanitizer) {

  }

  public resetAssets() {
    this.symbols = [];
  }

  public generateAsset() {
    for (let i = 0; i < 10; i++) {
      this.generateOneAsset();
    }
  }

  public generateOneAsset() {
    switch (this.selectedAssetOption.value) {
      case 'badge':
        this.generateRandomBadge();
        break;
      case 'symbol':
        this.generateRandomSymbol();
        break;
      case 'art':
        break;
      case 'background':
        this.generateRandomBackground();
        break;
      case 'banner':
        break;
      case 'textbox':
        break;
    }

  }

  public generateRandomBackground() {
    const svgString: string = generateRandomCardBackground({width: 500, height: 700});
    const safeSvg = this.sanitizer.bypassSecurityTrustHtml(svgString);
    this.symbols.push(safeSvg);
  }

  public generateRandomSymbol() {
    const svgString: string = generateRandomCardSymbol({
      width: 64, height: 64, 
      foregroundShape: {
        // type: 'convex',
        // fillColor: 'white',
        type: 'blob',
        fillColor: this.frontColor || undefined,
        outlineColor: this.outlineColor || '#262c35',
        outlineWidth: this.outlineWidth, 
        // mirror: 'none',
        // numPoints: 7,
      },
      backgroundShape: {
        // type: 'blob',
        // fillColor: 'grey',
        fillColor: this.backColor || undefined,
        outlineColor: this.outlineColor || '#262c35',
        outlineWidth: this.outlineWidth, 
        // mirror: 'none',
        // numPoints: 7,
      }
    });
    const safeSvg = this.sanitizer.bypassSecurityTrustHtml(svgString);
    this.symbols.push(safeSvg);
  }

  public generateRandomBadge() {
    const svgString: string = generateRandomCardSymbol({
      width: 64, height: 64, 
      foregroundShape: {
        type: 'convex',
        fillColor: this.frontColor || undefined,
        outlineColor: this.outlineColor || '#262c35',
        outlineWidth: this.outlineWidth, 
        mirror: 'none',
      },
      backgroundShape: {
        fillColor: this.backColor || undefined,
        outlineColor: this.outlineColor || '#262c35',
        outlineWidth: this.outlineWidth, 
      }
    });
    const safeSvg = this.sanitizer.bypassSecurityTrustHtml(svgString);
    this.symbols.push(safeSvg);
  }

}
