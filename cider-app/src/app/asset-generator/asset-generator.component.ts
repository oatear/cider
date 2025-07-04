import { Component } from '@angular/core';
import { generateRandomCardSymbol } from '../shared/generators/card-symbol-generator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { generateRandomCardBackground } from '../shared/generators/card-background-generator';
import { AssetsService } from '../data-services/services/assets.service';
import FileUtils from '../shared/utils/file-utils';

interface AssetTypeOption {
  label: string;
  value: 'symbol' | 'badge' | 'art' | 'background' | 'banner' | 'textbox';
}

interface ShapeTypeOption {
  label: string;
  value: 'blob' | 'star' | 'convex' | 'none' | undefined;
}

interface MirrorTypeOption {
  label: string;
  value: 'vertical' | 'horizontal' | 'both' | 'none' | undefined;
}

interface BackgroundTypeOption {
  label: string,
  value: 'solid' | 'none' | undefined;
}

interface GeneratedSvg {
  safeHtml: SafeHtml;
  svg: string;
  type: AssetTypeOption;
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
  shapeOptions: ShapeTypeOption[] = [
    { label: 'Random', value: undefined },
    { label: 'Blob', value: 'blob' },
    { label: 'Star', value: 'star' },
    { label: 'Convex', value: 'convex' },
    { label: 'None', value: 'none' },
  ];
  frontShape: ShapeTypeOption | undefined;
  backShape: ShapeTypeOption | undefined;
  mirrorOptions: MirrorTypeOption[] = [
    { label: 'Random', value: undefined },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' },
    { label: 'Both', value: 'both' },
    { label: 'None', value: 'none' },
  ];
  frontMirror: MirrorTypeOption | undefined;
  backMirror: MirrorTypeOption | undefined;
  backgroundOptions: BackgroundTypeOption[] = [
    { label: 'None', value: 'none' },
    { label: 'Solid', value: 'solid' },
  ]
  backgroundType: BackgroundTypeOption | undefined = this.backgroundOptions[0];
  frontColor: string | undefined;
  backColor: string | undefined;
  backgroundColor: string | undefined;
  outlineColor: string | undefined;
  outlineWidth: number = 2;
  imageWidth: number = 64;
  imageHeight: number = 64;
  frontScale: number = 0.7;
  saveSvg: string = "";
  saveName: string = "";

  public generatedSvgs: GeneratedSvg[] = [];

  constructor(private sanitizer: DomSanitizer,
    private assetsService: AssetsService
  ) {

  }

  public resetAssets() {
    this.generatedSvgs = [];
  }

  public generateAsset() {
    for (let i = 0; i < 5; i++) {
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
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
    });
  }

  public generateRandomSymbol() {
    const svgString: string = generateRandomCardSymbol({
      width: this.imageWidth || 64, 
      height: this.imageHeight || 64, 
      frontShape: {
        // type: 'convex',
        // fillColor: 'white',
        type: this.frontShape?.value || 'blob',
        fillColor: this.frontColor || undefined,
        outlineColor: this.outlineColor || undefined,
        outlineWidth: this.outlineWidth, 
        mirror: this.frontMirror?.value
        // numPoints: 7,
      },
      backShape: {
        // type: 'blob',
        // fillColor: 'grey',
        type: this.backShape?.value,
        fillColor: this.backColor || undefined,
        // outlineColor: this.outlineColor || '#262c35',
        outlineColor: this.outlineColor || undefined,
        outlineWidth: this.outlineWidth, 
        mirror: this.backMirror?.value
        // numPoints: 7,
      },
      backgroundType: this.backgroundType?.value,
      backgroundColor: this.backgroundColor,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
    });
  }

  public generateRandomBadge() {
    const svgString: string = generateRandomCardSymbol({
      width: this.imageWidth || 64, 
      height: this.imageHeight || 64, 
      frontShape: {
        type: this.frontShape?.value || 'convex',
        fillColor: this.frontColor || undefined,
        outlineColor: this.outlineColor || undefined,
        outlineWidth: this.outlineWidth, 
        mirror: this.frontMirror?.value || 'none',
      },
      backShape: {
        type: this.backShape?.value,
        fillColor: this.backColor || undefined,
        outlineColor: this.outlineColor || undefined,
        outlineWidth: this.outlineWidth, 
        mirror: this.backMirror?.value,
      },
      backgroundType: this.backgroundType?.value,
      backgroundColor: this.backgroundColor,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
    });
  }

  public showSavePopover(event: any, popover: any, asset: GeneratedSvg) {
    if (!popover.render) {
      this.saveSvg = asset.svg;
      this.saveName = `${asset.type.value}-${Math.random().toString(36).substr(2, 9)}`;
    }
    popover.toggle(event);
  }

  public saveAsset(event: any, popover: any) {
    // save the selected asset
    this.assetsService.create({
      name: this.saveName,
      file: FileUtils.svgStringToBlob(this.saveSvg),
    } as any).then(() => {
      popover.hide(event);
    });
  }

}
