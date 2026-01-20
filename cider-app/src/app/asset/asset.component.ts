import { Component } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../data-services/types/asset.type';
import { ConfirmationService, MessageService } from 'primeng/api';
import StringUtils from '../shared/utils/string-utils';
import FileUtils from '../shared/utils/file-utils';
import { combineLatest, forkJoin, take } from 'rxjs';
import { parse } from 'opentype.js';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrl: './asset.component.scss',
  providers: [MessageService, ConfirmationService],
  standalone: false
})
export class AssetComponent {
  public asset: Asset = {} as Asset;
  public zoom: number = 1.0;
  public zoomStep: number = 0.1;
  dialogVisible: boolean = false;
  public imageDimensions: { width: number, height: number } = { width: 0, height: 0 };
  public fileSize: string = '';
  public fileExtension: string = '';
  public fileMime: string = '';
  public fileType: string = '';
  assetUrls: any;
  public fontPreviewFamily: string = '';
  public previewText: string = 'The quick brown fox jumps over the lazy dog. 1234567890';
  public previewFontSize: number = 24;

  // Dictionary for 'Copied' state management
  public copyState: { [key: string]: boolean } = {};
  public fontMetadata: any = null;
  public fontUsageSnippet: string = '';

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public assetsService: AssetsService) {

    combineLatest({
      assetUrls: this.assetsService.getAssetUrls(),
      routeParams: this.route.paramMap
    }).subscribe(({ assetUrls, routeParams }) => {
      const assetIdString = routeParams.get('assetId') || '';
      const assetId = parseInt(assetIdString, 10);
      this.assetUrls = assetUrls;

      if (!isNaN(assetId)) {
        this.assetsService.get(assetId).then((asset) => {
          this.asset = asset;
          this.updateFileDetails();
        }).catch(error => {
          console.error(`Error fetching asset with ID ${assetId}:`, error);
        });
      }

    });
  }

  private updateFileDetails() {
    if (this.asset && this.asset.name && this.assetUrls) {
      const fileUrl = this.getAssetUrl(this.asset, this.assetUrls);
      if (fileUrl) {
        this.fileSize = FileUtils.formatFileSize(this.asset.file.size);
        this.fileExtension = StringUtils.mimeToExtension(this.asset.file.type);
        this.fileMime = this.asset.file.type;
        this.fileType = StringUtils.mimeToTypeCategory(this.asset.file.type);

        // get image dimensions if the file is an image
        if (this.fileType === 'image') {
          FileUtils.getImageDimensions(fileUrl).then(dimensions => {
            this.imageDimensions = dimensions;
          }).catch(error => {
            console.error('Error getting image dimensions:', error);
          });
        }

        if (this.fileType === 'font') {
          this.extractFontMetadata(this.asset.file);
        }
      }
    }
  }

  private extractFontMetadata(file: Blob) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      try {
        const font = parse(buffer);
        const names = font.names as any;
        const getEnglishName = (key: string) => {
          return names[key] ? (names[key]['en'] || Object.values(names[key])[0]) : '';
        };

        this.fontMetadata = {
          fontFamily: getEnglishName('fontFamily'),
          fontSubfamily: getEnglishName('fontSubfamily'),
          fullName: getEnglishName('fullName'),
          postScriptName: getEnglishName('postScriptName'),
          designer: getEnglishName('designer'),
          designerURL: getEnglishName('designerURL'),
          manufacturer: getEnglishName('manufacturer'),
          manufacturerURL: getEnglishName('manufacturerURL'),
          license: getEnglishName('license'),
          licenseURL: getEnglishName('licenseURL'),
          version: getEnglishName('version'),
          copyright: getEnglishName('copyright'),
          description: getEnglishName('description')
        };

        const cssFontFamily = this.fontMetadata.fontFamily || 'MyFont';

        // Construct Handlebars path
        let handlebarsPath = 'assets';
        if (this.asset.path) {
          const parts = this.asset.path.split('/');
          for (const part of parts) {
            handlebarsPath += '.' + StringUtils.toKebabCase(part);
          }
        }
        handlebarsPath += '.' + StringUtils.toKebabCase(this.asset.name);

        // Determine format
        let fontFormat = 'truetype';
        if (this.fileExtension === 'otf') fontFormat = 'opentype';
        else if (this.fileExtension === 'woff') fontFormat = 'woff';
        else if (this.fileExtension === 'woff2') fontFormat = 'woff2';

        this.fontUsageSnippet = `/* Add to global-styles */
@font-face {
  font-family: '${cssFontFamily}';
  src: url('{{${handlebarsPath}}}') format('${fontFormat}');
}

/* Use in your template */
.my-element {
  font-family: '${cssFontFamily}';
}`;

        // Load font for preview
        const previewFamilyName = `PreviewFont-${this.asset.id}`;
        const fontFace = new FontFace(previewFamilyName, buffer);
        await fontFace.load();
        (document.fonts as any).add(fontFace);
        this.fontPreviewFamily = previewFamilyName;

      } catch (err) {
        console.error('Error parsing font:', err);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  public copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copyState[key] = true;
      setTimeout(() => {
        this.copyState[key] = false;
      }, 2000);
    });
  }

  public increasePreviewFontSize() {
    this.previewFontSize = Math.min(72, this.previewFontSize + 2);
  }

  public decreasePreviewFontSize() {
    this.previewFontSize = Math.max(12, this.previewFontSize - 2);
  }

  public changeZoom(change: number) {
    this.zoom += change;
    if (this.zoom < 0.1) {
      this.zoom = 0.1;
    }
  }

  public openEditDialog(asset: Asset) {
    this.asset = asset;
    this.dialogVisible = true;
  }

  public save(asset: Asset) {
    const id = (<any>asset)[this.assetsService?.getIdField()];
    this.updateExisting(id, asset);
  }

  public updateExisting(id: number, asset: Asset) {
    this.assetsService?.update(id, asset).then(result => {
    }).catch(error => {
      console.log('error saving entity', error);
    });
  }

  public openDeleteDialog(entity: Asset) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entity?',
      header: 'Delete Entity',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.assetsService?.delete((<any>entity)[this.assetsService?.getIdField()]).then(deleted => {
          // this.messageService.add({severity:'success', summary: 'Successful', detail: 'Entity Deleted', life: 3000});
        });
      }
    });
  }

  public getAssetUrl(asset: Asset, assetUrls: any): string {
    let currentLevel = assetUrls;
    if (asset.path) {
      const parts = asset.path.split('/');
      for (const part of parts) {
        const key = StringUtils.toKebabCase(part);
        if (currentLevel[key]) {
          currentLevel = currentLevel[key];
        } else {
          return '';
        }
      }
    }
    return currentLevel[StringUtils.toKebabCase(asset.name)];
  }

}
