import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, QueryList, SecurityContext, SimpleChanges, ViewChildren } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { v4 as uuid } from 'uuid';
import { AsyncSubject, lastValueFrom } from 'rxjs';
import { RenderCacheService } from '../data-services/services/render-cache.service';
import { CardToHtmlPipe } from '../shared/pipes/template-to-html.pipe';
import { ImageRendererService } from '../data-services/services/image-renderer.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import GeneralUtils from '../shared/utils/general-utils';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPreviewComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @ViewChildren('cardElement') cardElement: QueryList<any> = {} as QueryList<any>;
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() scale: number = 1.0;
  @Input() lowInk: boolean = false;
  @Input() cache: boolean = false;
  @Input() tiltable: boolean = false;
  @Input() holographic: boolean | undefined = false;
  @Input() version: number = 0;

  initialWidth: number = 0;
  initialHeight: number = 0;
  assetUrls: any;
  uuid: string = uuid();
  cachedImageUrl?: string;
  invalidTemplate: boolean = false;
  private isLoadedSubject: AsyncSubject<boolean>;
  private isCacheLoadedSubject: AsyncSubject<boolean>;
  private resizeObserver?: ResizeObserver;

  constructor(
    private assetsService: AssetsService,
    private renderCacheService: RenderCacheService,
    private imageRendererService: ImageRendererService,
    private element: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private cardToHtmlPipe: CardToHtmlPipe,
    private sanitizer: DomSanitizer) {
    this.isLoadedSubject = new AsyncSubject();
    this.isCacheLoadedSubject = new AsyncSubject();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentRect.width || (entry.target as HTMLElement).offsetWidth;
        const height = entry.contentRect.height || (entry.target as HTMLElement).offsetHeight;

        if (width > 0 && height > 0) {
          this.initialWidth = width;
          this.initialHeight = height;
          this.isLoadedSubject.next(true);
          this.isLoadedSubject.complete();
          this.changeDetectorRef.detectChanges();
          this.resizeObserver?.disconnect();
        }
      }
    });
    this.resizeObserver.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => {
      this.assetUrls = assetUrls;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cardChange = changes['card'];
    const templateChange = changes['template'];
    const scaleChange = changes['scale'];

    if ((cardChange && !cardChange.isFirstChange()) || (templateChange && !templateChange.isFirstChange())) {
      this.isLoadedSubject = new AsyncSubject();
      this.isCacheLoadedSubject = new AsyncSubject();
      this.initialWidth = 0;
      this.initialHeight = 0;
      this.cachedImageUrl = undefined;
      this.invalidTemplate = false;
      // Re-observe to get new dimensions if template changed
      this.resizeObserver?.observe(this.element.nativeElement);
    }

    if (this.cache && this.assetUrls) {
      lastValueFrom(this.isLoadedSubject).then(() => {
        this.renderCacheService.getOrSet(this.getHash(),
          () => GeneralUtils.delay(2000).then(() => this.toImageUrl()))
          .subscribe({
            next: (cachedImageUrl) => {
              this.cachedImageUrl = cachedImageUrl;
              GeneralUtils.delay(1000).then(() => {
                this.isCacheLoadedSubject.next(true);
                this.isCacheLoadedSubject.complete();
              });
              this.changeDetectorRef.markForCheck();
            },
            error: (error) => {
              this.invalidTemplate = true;
              this.isCacheLoadedSubject.error('Failed to generate card image');
              this.isCacheLoadedSubject.complete();
              this.changeDetectorRef.markForCheck();
            }
          });
      });
    }
  }

  public getHash(): number {
    const html = this.cardToHtmlPipe.transform(this.template, this.card, this.assetUrls);
    return this.renderCacheService.calculateHash((html as any).changingThisBreaksApplicationSecurity);
  }

  public toImageUrl(): Promise<string> {
    const filter = (node: HTMLElement) => {
      return 'style' !== node.localName;
    };
    return this.imageRendererService.toPng((<any>this.cardElement.get(0)).nativeElement, { pixelRatio: 1.0, filter: filter });
  }

  public isLoaded() {
    return this.isLoadedSubject.asObservable();
  }

  public isCacheLoaded() {
    return this.isCacheLoadedSubject.asObservable();
  }
}

