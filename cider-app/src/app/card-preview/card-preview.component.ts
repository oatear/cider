import { Component, Input, OnInit } from '@angular/core';
import { AssetsService } from '../data-services/services/assets.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-card-preview',
  templateUrl: './card-preview.component.html',
  styleUrls: ['./card-preview.component.scss']
})
export class CardPreviewComponent implements OnInit {
  @Input() card: Card = {} as Card;
  @Input() template: CardTemplate = {} as CardTemplate;

  assetUrls: any;

  constructor(
    private assetsService: AssetsService) { }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => this.assetUrls = assetUrls);
  }

}
