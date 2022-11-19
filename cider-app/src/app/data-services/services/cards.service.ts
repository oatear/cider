import { Injectable } from '@angular/core';
import { Card } from '../types/card.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { CardAttributesService } from './card-attributes.service';
import { CardTemplatesService } from './card-templates.service';
import { EntityField } from '../types/entity-field.type';
import { DecksChildService as DecksChildService } from '../indexed-db/decks-child.service';
import { DecksService } from './decks.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService extends DecksChildService<Card, number> {

  constructor(private attributesService: CardAttributesService,
    private cardTemplatesService: CardTemplatesService,
    decksService: DecksService) {
    super(decksService, AppDB.CARDS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'deckId', header: 'Deck ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, description: 'The name of the card'},
      {field: 'count', header: 'Count', type: FieldType.number, description: 'How many of this card appear in the deck'},
      {field: 'frontCardTemplateId', header: 'Front Template', type: FieldType.option, 
        service: <any>cardTemplatesService, description: "The card's front template"},
      {field: 'backCardTemplateId', header: 'Back Template', type: FieldType.option, 
        service: <any>cardTemplatesService, description: "The card's back template"}
    ]);
  }
  
  override getFields() {
    return this.attributesService.getAll().then(attributes => this.fields.concat(attributes.map(attribute => {
      return {
        field: attribute.name.trim().replace(/ /g, '-').toLowerCase(),
        header: attribute.name,
        type: attribute.type,
        description: attribute.description,
        options: attribute.options
      } as EntityField<Card>;
    })));
  }

  override getEntityName(entity: Card) {
    return entity.name;
  }
}
