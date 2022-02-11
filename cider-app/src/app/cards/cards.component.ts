import { Component, OnInit } from '@angular/core';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardsService } from '../data-services/services/cards.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  constructor(public cardsService: CardsService,
    public attributesService: CardAttributesService) { }

  ngOnInit(): void {
  }

}
