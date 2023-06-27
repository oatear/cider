import { AfterViewChecked, ChangeDetectorRef, Component, DoCheck, ElementRef, Input, OnInit, QueryList, SecurityContext, ViewChildren } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { v4 as uuid } from 'uuid';
import { AsyncSubject, lastValueFrom } from 'rxjs';
import { RenderCacheService } from '../data-services/services/render-cache.service';
import { CardToHtmlPipe } from '../shared/pipes/template-to-html.pipe';
import * as htmlToImage from 'html-to-image';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit, AfterViewChecked {
  @ViewChildren('cardElement') cardElement: QueryList<any> = {} as QueryList<any>;
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() scale: number = 1.0;
  @Input() lowInk: boolean = false;
  @Input() cache: boolean = true;
  initialWidth: number = 0;
  initialHeight: number = 0;
  assetUrls: any;
  uuid: string  = uuid();
  cachedImageUrl?: string;
  private isLoadedSubject: AsyncSubject<boolean>;

  constructor(
    private assetsService: AssetsService,
    private renderCacheService: RenderCacheService,
    private element: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private cardToHtmlPipe: CardToHtmlPipe,
    private sanitizer: DomSanitizer) { 
      this.isLoadedSubject = new AsyncSubject();
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
        // console.log('card-preview ngAfterViewChecked', this.initialWidth, this.initialHeight);
        this.isLoadedSubject.next(true);
        this.isLoadedSubject.complete();
        this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => {
      this.assetUrls = assetUrls;
      lastValueFrom(this.isLoadedSubject).then(() => {
        this.renderCacheService.getOrSet(this.getHash(), () => this.toImageUrl())
        .subscribe((cachedImageUrl) => {
            this.cachedImageUrl = cachedImageUrl
        });
      });
    });
  }

  getSanitizedCachedImageUrl(): SafeUrl {
    if (!this.cachedImageUrl) {
      return this.sanitizer.bypassSecurityTrustUrl('');
    }
    return this.sanitizer.bypassSecurityTrustUrl(this.cachedImageUrl);
  }

  public getHash(): number {
    const html = this.cardToHtmlPipe.transform(this.template, this.card, this.assetUrls);
    return this.renderCacheService.calculateHash((html as any).changingThisBreaksApplicationSecurity);
  }

  public toImageUrl(): Promise<string> {
    return htmlToImage.toPng((<any>this.cardElement.get(0)).nativeElement, {pixelRatio: 1.0});
  }

  public isLoaded() {
    return this.isLoadedSubject.asObservable();
  }
}
