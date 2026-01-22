import { Component } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../data-services/types/asset.type';
import { ConfirmationService, MessageService } from 'primeng/api';
import StringUtils from '../shared/utils/string-utils';
import FileUtils from '../shared/utils/file-utils';
import { combineLatest, forkJoin, take } from 'rxjs';
import { parse } from 'opentype.js';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrl: './asset.component.scss',
  providers: [MessageService, ConfirmationService],
  standalone: false
})
export class AssetComponent {
  protected readonly math = Math;
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

  // SVG Editor Properties
  public isSvg: boolean = false;
  public svgContent: string = '';
  public originalSvgContent: string = '';
  public svgPreviewUrl: SafeUrl | null = null;
  public svgColors: { original: string, current: string, currentAlpha: number }[] = [];
  public svgStrokeWidths: { original: string, current: number, suffix: string }[] = [];
  public showSvgEditor: boolean = true;

  // History for Undo/Redo
  public svgHistory: { colors: { original: string, current: string, currentAlpha: number }[], strokeWidths: { original: string, current: number, suffix: string }[] }[] = [];

  // ...


  public currentHistoryIndex: number = -1;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer,
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

        if (this.fileExtension === 'svg') {
          this.isSvg = true;
          this.loadSvgContent(this.asset.file);
        } else {
          this.isSvg = false;
          this.svgPreviewUrl = null;
        }
      }
    }
  }

  private loadSvgContent(file: Blob) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalSvgContent = e.target?.result as string;
      this.svgContent = this.originalSvgContent;
      this.extractSvgProperties();
      this.updateSvgPreview();
      // Initialize history
      this.svgHistory = [];
      this.currentHistoryIndex = -1;
      this.pushHistory();
    };
    reader.readAsText(file);
  }

  private extractSvgProperties() {
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.svgContent, 'image/svg+xml');

    // Extract Colors (fill and stroke)
    const colorSet = new Set<string>();
    const elements = doc.querySelectorAll('*');

    elements.forEach(el => {
      const fill = el.getAttribute('fill');
      const stroke = el.getAttribute('stroke');
      const style = el.getAttribute('style');

      if (fill && fill !== 'none' && fill !== 'currentColor') colorSet.add(fill);
      if (stroke && stroke !== 'none' && stroke !== 'currentColor') colorSet.add(stroke);

      if (style) {
        // Simple style parsing for fill/stroke
        const styleProps = style.split(';').map(s => s.trim());
        styleProps.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if ((key === 'fill' || key === 'stroke') && value && value !== 'none' && value !== 'currentColor') {
            colorSet.add(value);
          }
        });
      }
    });

    this.svgColors = Array.from(colorSet).map(c => {
      const parsed = this.parseColor(c);
      return { original: c, current: parsed.hex, currentAlpha: parsed.alpha };
    });


    // Extract Stroke Widths
    const widthMap = new Map<string, { original: string, current: number, suffix: string }>();

    elements.forEach(el => {
      const strokeWidth = el.getAttribute('stroke-width');

      const processWidth = (val: string) => {
        if (!val || val === 'none') return;
        if (widthMap.has(val)) return;

        const match = val.match(/^([\d.]+)(.*)$/);
        if (match) {
          widthMap.set(val, {
            original: val,
            current: parseFloat(match[1]),
            suffix: match[2] || ''
          });
        }
      };

      if (strokeWidth) processWidth(strokeWidth);

      const style = el.getAttribute('style');
      if (style) {
        const styleProps = style.split(';').map(s => s.trim());
        styleProps.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (key === 'stroke-width') {
            processWidth(value);
          }
        });
      }
    });

    this.svgStrokeWidths = Array.from(widthMap.values());
  }

  public updateSvgPreview() {
    let content = this.originalSvgContent;

    // Apply Colors
    this.svgColors.forEach(color => {
      if (color.original !== color.current) {
        // Creating a global regex to replace all instances of this color
        // Escaping special characters for regex
        const safeOriginal = color.original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`(?<=[:"'])${safeOriginal}(?=['";])|(?<=[:"'])${safeOriginal}$`, 'g');
        // This simple regex might be risky if color strings are very short standard words, but for hex/rgb it's usually fine.
        // Better safety: replace attributes specifically? String replace is faster/easier but less robust.
        // Let's stick to string replacement for now but maybe refine if needed.
        // Actually, global replace on the string is dangerous (e.g. replacing 'fff' inside 'xfff').
        // A safer approach is re-parsing the DOM, but that's heavier. 
        // Let's try DOM manipulation on the preview copy.
      }
    });

    // Better approach: Work on a DOM copy for preview generation
    const parser = new DOMParser();
    const doc = parser.parseFromString(this.originalSvgContent, 'image/svg+xml');
    const elements = doc.querySelectorAll('*');

    elements.forEach(el => {
      // Colors
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      const fill = el.getAttribute('fill');
      if (fill) {
        const mapped = this.svgColors.find(c => c.original === fill);
        if (mapped) el.setAttribute('fill', hexToRgba(mapped.current, mapped.currentAlpha));
      }
      const stroke = el.getAttribute('stroke');
      if (stroke) {
        const mapped = this.svgColors.find(c => c.original === stroke);
        if (mapped) el.setAttribute('stroke', hexToRgba(mapped.current, mapped.currentAlpha));
      }

      let style = el.getAttribute('style');
      if (style) {
        let parts = style.split(';').map(p => p.trim()).filter(p => !!p);
        let changed = false;
        parts = parts.map(part => {
          let [key, val] = part.split(':').map(s => s.trim());
          if (key === 'fill' || key === 'stroke') {
            const mapped = this.svgColors.find(c => c.original === val);
            if (mapped) {
              changed = true;
              return `${key}:${hexToRgba(mapped.current, mapped.currentAlpha)}`;
            }
          }
          if (key === 'stroke-width') {
            const mapped = this.svgStrokeWidths.find(w => w.original === val);
            if (mapped) {
              changed = true;
              return `${key}:${mapped.current}${mapped.suffix}`;
            }
          }
          return part;
        });
        if (changed) el.setAttribute('style', parts.join('; '));
      }

      // Stroke Widths
      const sw = el.getAttribute('stroke-width');
      if (sw) {
        const mapped = this.svgStrokeWidths.find(w => w.original === sw);
        if (mapped) el.setAttribute('stroke-width', `${mapped.current}${mapped.suffix}`);
      }
    });

    const serializer = new XMLSerializer();
    this.svgContent = serializer.serializeToString(doc);

    const blob = new Blob([this.svgContent], { type: 'image/svg+xml' });
    this.svgPreviewUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }

  public onSvgChange() {
    this.updateSvgPreview();
    this.pushHistory();
  }

  // History Management
  public pushHistory() {
    // Remove any future history if we are in the middle of the stack
    if (this.currentHistoryIndex < this.svgHistory.length - 1) {
      this.svgHistory = this.svgHistory.slice(0, this.currentHistoryIndex + 1);
    }

    // Deep copy current state
    const state = {
      colors: JSON.parse(JSON.stringify(this.svgColors)),
      strokeWidths: JSON.parse(JSON.stringify(this.svgStrokeWidths))
    };

    this.svgHistory.push(state);
    this.currentHistoryIndex++;
  }

  public undo() {
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
      this.restoreState(this.svgHistory[this.currentHistoryIndex]);
    }
  }

  public redo() {
    if (this.currentHistoryIndex < this.svgHistory.length - 1) {
      this.currentHistoryIndex++;
      this.restoreState(this.svgHistory[this.currentHistoryIndex]);
    }
  }

  private restoreState(state: any) {
    this.svgColors = JSON.parse(JSON.stringify(state.colors));
    this.svgStrokeWidths = JSON.parse(JSON.stringify(state.strokeWidths));
    this.updateSvgPreview();
  }

  public saveSvgChanges() {
    const blob = new Blob([this.svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], this.asset.name, { type: 'image/svg+xml' });

    // Update asset object
    this.asset.file = file;

    // Use existing save mechanism
    this.updateExisting(this.asset.id, this.asset);

    // Manually force URL update to ensure view reflects change immediately if not handled by service automatically for same object ref
    // Actually service.update() triggers updateAssetUrls() which makes new URLs. We just need to wait for subscription to update.
    // But we might need to update local preview if we want to stay in edit mode or exit it.
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'SVG updated successfully' });
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

  public resetZoom() {
    this.zoom = 1.0;
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

  private parseColor(color: string): { hex: string, alpha: number } {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return { hex: '#000000', alpha: 1 };

    // Reset to black first to ensure invalid colors don't keep previous state?
    // Actually current browser implementations are robust.
    ctx.fillStyle = color;
    const computed = ctx.fillStyle;

    // Hex (opaque) - browser usually normalizes to #rrggbb
    if (computed.startsWith('#')) {
      let hex = computed;
      if (hex.length === 4) {
        hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
      }
      return { hex: hex, alpha: 1 };
    }

    // RGBA
    if (computed.startsWith('rgba')) {
      const matches = computed.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (matches) {
        const r = parseInt(matches[1]).toString(16).padStart(2, '0');
        const g = parseInt(matches[2]).toString(16).padStart(2, '0');
        const b = parseInt(matches[3]).toString(16).padStart(2, '0');
        const a = parseFloat(matches[4]);
        return { hex: `#${r}${g}${b}`, alpha: a };
      }
    }

    // RGB (opaque) - some browsers convert colors to rgb()
    if (computed.startsWith('rgb')) {
      const matches = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (matches) {
        const r = parseInt(matches[1]).toString(16).padStart(2, '0');
        const g = parseInt(matches[2]).toString(16).padStart(2, '0');
        const b = parseInt(matches[3]).toString(16).padStart(2, '0');
        return { hex: `#${r}${g}${b}`, alpha: 1 };
      }
    }

    // Fallback
    return { hex: '#000000', alpha: 1 };
  }

}
