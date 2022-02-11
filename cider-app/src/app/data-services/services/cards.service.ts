import { Injectable } from '@angular/core';
import { Card } from '../types/card.type';
import { FieldType } from '../types/entity-field.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';

@Injectable({
  providedIn: 'root'
})
export class CardsService extends IndexedDbService<Card, number> {

  constructor() {
    super(AppDB.CARDS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'frontCardTemplateId', header: 'Front Template', type: FieldType.number},
      {field: 'backCardTemplateId', header: 'Back Template', type: FieldType.number}
    ]);
  }
}
