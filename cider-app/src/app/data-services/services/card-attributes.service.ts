import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { CardAttribute } from '../types/card-attribute.type';
import { FieldType } from '../types/field-type.type';
import { DecksService } from './decks.service';

@Injectable({
  providedIn: 'root'
})
export class CardAttributesService extends DecksChildService<CardAttribute, number> {

  constructor(decksService: DecksService, db: AppDB) { 
    super(decksService, db, AppDB.CARD_ATTRIBUTES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'deckId', header: 'Deck ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text},
      {field: 'description', header: 'Description', type: FieldType.text},
      {field: 'type', header: 'Type', type: FieldType.option, 
        options: [FieldType.text, FieldType.textArea, FieldType.option]},
      {field: 'options', header: 'Options', type: FieldType.optionList}
    ])
  }
  
  override getEntityName(entity: CardAttribute) {
    return entity.name;
  }
}
