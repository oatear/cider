import { Component, OnInit } from '@angular/core';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { DecksService } from '../data-services/services/decks.service';

@Component({
  selector: 'app-card-attributes',
  templateUrl: './card-attributes.component.html',
  styleUrls: ['./card-attributes.component.scss']
})
export class CardAttributesComponent implements OnInit {

  constructor(public attributesService: CardAttributesService) { }

  ngOnInit(): void {
  }

}
