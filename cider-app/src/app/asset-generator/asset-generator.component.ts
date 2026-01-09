import { Component } from '@angular/core';
import { generateRandomCardSymbol } from '../shared/generators/card-symbol-generator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { generateRandomCardBackground } from '../shared/generators/card-background-generator';
import { AssetsService } from '../data-services/services/assets.service';
import FileUtils from '../shared/utils/file-utils';
import { generateRandomDialogFrame } from '../shared/generators/card-textbox-generator';

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
  width: number;
  height: number;
}

@Component({
    selector: 'app-asset-generator',
    templateUrl: './asset-generator.component.html',
    styleUrl: './asset-generator.component.scss',
    standalone: false
})
export class AssetGeneratorComponent {
  assetOptions: AssetTypeOption[] = [
    { label: 'Symbol', value: 'symbol' }, 
    { label: 'Badge', value: 'badge' }, 
    { label: 'Art', value: 'art' },
    // { label: 'Background', value: 'background' },
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
    { label: 'Default', value: undefined },
    { label: 'None', value: 'none' },
    { label: 'Solid', value: 'solid' },
  ]
  backgroundType: BackgroundTypeOption | undefined = this.backgroundOptions[0];
  frontColor: string | undefined;
  backColor: string | undefined;
  backgroundColor: string | undefined;
  outlineColor: string | undefined;
  outlineWidth: number | undefined = undefined;
  imageWidth: number | undefined = undefined;
  imageHeight: number | undefined = undefined;
  frontScale: number | undefined = undefined;
  turbulence: number | undefined = undefined;
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
        this.generateRandomArt();
        break;
      case 'background':
        this.generateRandomBackground();
        break;
      case 'banner':
        this.generateRandomBanner();
        break;
      case 'textbox':
        this.generateRandomTextbox();
        break;
    }

  }

  public generateRandomBackground() {
    const width: number = this.imageWidth ?? 500;
    const height: number = this.imageHeight ?? 700;
    const svgString: string = generateRandomCardBackground({
      width: width, 
      height: height,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
    });
  }

  public generateRandomSymbol() {
    const width: number = this.imageWidth ?? 64;
    const height: number = this.imageHeight ?? 64;
    const svgString: string = generateRandomCardSymbol({
      width: width, 
      height: height, 
      frontShape: {
        type: this.frontShape?.value ?? 'blob',
        fillColor: this.frontColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.frontMirror?.value
      },
      backShape: {
        type: this.backShape?.value,
        fillColor: this.backColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.backMirror?.value
      },
      backgroundType: this.backgroundType?.value,
      backgroundColor: this.backgroundColor,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
    });
  }

  public generateRandomBadge() {
    const width: number = this.imageWidth || 64;
    const height: number = this.imageHeight || 64;
    const svgString: string = generateRandomCardSymbol({
      width: width, 
      height: height, 
      frontShape: {
        type: this.frontShape?.value ?? 'convex',
        fillColor: this.frontColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.frontMirror?.value ?? 'none',
      },
      backShape: {
        type: this.backShape?.value,
        fillColor: this.backColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.backMirror?.value,
      },
      backgroundType: this.backgroundType?.value,
      backgroundColor: this.backgroundColor,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
    });
  }

  public generateRandomArt() {
    const width: number = this.imageWidth ?? 640;
    const height: number = this.imageHeight ?? 480;
    const svgString: string = generateRandomCardSymbol({
      width: width, 
      height: height, 
      frontShape: {
        type: this.frontShape?.value ?? 'blob',
        fillColor: this.frontColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.frontMirror?.value
      },
      backShape: {
        type: this.backShape?.value,
        fillColor: this.backColor,
        outlineColor: this.outlineColor,
        outlineWidth: this.outlineWidth ?? 2, 
        mirror: this.backMirror?.value
      },
      backgroundType: this.backgroundType?.value ?? 'solid',
      backgroundColor: this.backgroundColor,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
    });
  }
  
  public generateRandomBanner() {
    const width: number = this.imageWidth || 640;
    const height: number = this.imageHeight || 100;
    const svgString: string = generateRandomDialogFrame({
      width: width, 
      height: height, 
      turbulence: this.turbulence ?? 0.2,
      frontColor: this.frontColor,
      backColor: this.backColor,
      outlineColor: this.outlineColor,
      outlineWidth: this.outlineWidth,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
    });
  }

  public generateRandomTextbox() {
    const width: number = this.imageWidth ?? 640;
    const height: number = this.imageHeight ?? 320;
    const svgString: string = generateRandomDialogFrame({
      width: width, 
      height: height, 
      turbulence: this.turbulence ?? 0.2,
      frameOption: 'rounded',
      edgeOption: 'ripped',
      frameWidth: 0,
      resketch: true,
      frontColor: this.frontColor,
      backColor: this.backColor,
      outlineColor: this.outlineColor,
      outlineWidth: this.outlineWidth ?? 2,
    });
    this.generatedSvgs.push({
      safeHtml: this.sanitizer.bypassSecurityTrustHtml(svgString),
      svg: svgString,
      type: this.selectedAssetOption,
      width: width,
      height: height,
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
