import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { DecksService } from './decks.service';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends DecksChildService<CardTemplate, number> {

  constructor(decksService: DecksService, db: AppDB) {
    super(decksService, db, AppDB.CARD_TEMPLATES_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'deckId', header: 'Deck ID', type: FieldType.numeric, hidden: true },
      { field: 'name', header: 'Name', type: FieldType.text },
      { field: 'description', header: 'Description', type: FieldType.text },
      { field: 'html', header: 'HTML', type: FieldType.text, hidden: true },
      { field: 'css', header: 'CSS', type: FieldType.text, hidden: true }
    ]);
  }

  override getEntityName(entity: CardTemplate) {
    return entity.name;
  }
}
