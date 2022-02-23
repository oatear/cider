import { AfterViewChecked, Component, DoCheck, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';
import { CardToHtmlPipe } from '../shared/pipes/template-to-html.pipe';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit, DoCheck {
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() scale: number = 1.0;
  initialWidth: number = 0;
  initialHeight: number = 0;
  assetUrls: any;

  constructor(
    private assetsService: AssetsService,
    private element: ElementRef) { }

  ngDoCheck(): void {
    if (!this.initialWidth && !this.initialHeight
      && this.element?.nativeElement.offsetWidth
      && this.element?.nativeElement.offsetHeight) {
        this.initialWidth = this.element?.nativeElement.offsetWidth;
        this.initialHeight = this.element?.nativeElement.offsetHeight;
        console.log('initial dimensions: ', this.initialWidth, this.initialHeight);
    }
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => this.assetUrls = assetUrls);
  }
}
