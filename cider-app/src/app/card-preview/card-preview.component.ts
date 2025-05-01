import { AfterViewChecked, ChangeDetectorRef, Component, DoCheck, ElementRef, Input, OnChanges, OnInit, QueryList, SecurityContext, SimpleChanges, ViewChildren } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { v4 as uuid } from 'uuid';
import { AsyncSubject, lastValueFrom } from 'rxjs';
import { RenderCacheService } from '../data-services/services/render-cache.service';
import { CardToHtmlPipe } from '../shared/pipes/template-to-html.pipe';
import * as htmlToImage from 'html-to-image';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import GeneralUtils from '../shared/utils/general-utils';
import { error } from 'console';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit, AfterViewChecked, OnChanges {
  @ViewChildren('cardElement') cardElement: QueryList<any> = {} as QueryList<any>;
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() scale: number = 1.0;
  @Input() lowInk: boolean = false;
  @Input() cache: boolean = false;
  initialWidth: number = 0;
  initialHeight: number = 0;
  assetUrls: any;
  uuid: string  = uuid();
  cachedImageUrl?: string;
  invalidTemplate: boolean = false;
  private isLoadedSubject: AsyncSubject<boolean>;
  private isCacheLoadedSubject: AsyncSubject<boolean>;

  constructor(
    private assetsService: AssetsService,
    private renderCacheService: RenderCacheService,
    private element: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private cardToHtmlPipe: CardToHtmlPipe,
    private sanitizer: DomSanitizer) { 
      this.isLoadedSubject = new AsyncSubject();
      this.isCacheLoadedSubject = new AsyncSubject();
  }

  /**
   * Setup the initial width and height when the view fully renders once
   */
  ngAfterViewChecked(): void {
    if (!this.initialWidth && !this.initialHeight
      && this.element?.nativeElement.offsetWidth
      && this.element?.nativeElement.offsetHeight) {
        this.initialWidth = this.element?.nativeElement.offsetWidth;
        this.initialHeight = this.element?.nativeElement.offsetHeight;
        this.isLoadedSubject.next(true);
        this.isLoadedSubject.complete();
        this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => {
      this.assetUrls = assetUrls;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
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
          },
          error: (error) => {
            this.invalidTemplate = true;
            this.isCacheLoadedSubject.error('Failed to generate card image');
            this.isCacheLoadedSubject.complete();
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
    return htmlToImage.toPng((<any>this.cardElement.get(0)).nativeElement, {pixelRatio: 1.0, filter: filter});
  }

  public isLoaded() {
    return this.isLoadedSubject.asObservable();
  }

  public isCacheLoaded() {
    return this.isCacheLoadedSubject.asObservable();
  }
}
