import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends IndexedDbService<CardTemplate, number> {

  constructor() {
    super(AppDB.CARD_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'description', header: 'Description', type: FieldType.string},
      {field: 'html', header: 'HTML', type: FieldType.string, hidden: true},
      {field: 'css', header: 'CSS', type: FieldType.string, hidden: true}
    ]);
  }

  override getEntityName(entity: CardTemplate) {
    return entity.name;
  }
}
