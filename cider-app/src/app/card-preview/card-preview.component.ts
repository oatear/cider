import { AfterViewChecked, ChangeDetectorRef, Component, DoCheck, ElementRef, Input, OnInit } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit, AfterViewChecked {
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() scale: number = 1.0;
  @Input() lowInk: boolean = false;
  initialWidth: number = 0;
  initialHeight: number = 0;
  assetUrls: any;
  uuid: string  = uuid();

  constructor(
    private assetsService: AssetsService,
    private element: ElementRef,
    private changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Setup the initial width and height once the view fully renders once
   */
  ngAfterViewChecked(): void {
    if (!this.initialWidth && !this.initialHeight
      && this.element?.nativeElement.offsetWidth
      && this.element?.nativeElement.offsetHeight) {
        this.initialWidth = this.element?.nativeElement.offsetWidth;
        this.initialHeight = this.element?.nativeElement.offsetHeight;
        this.changeDetectorRef.detectChanges();
    }
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => this.assetUrls = assetUrls);
  }
}
