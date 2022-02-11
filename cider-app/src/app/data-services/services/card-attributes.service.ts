import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { CardAttribute } from '../types/card-attribute.type';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class CardAttributesService extends IndexedDbService<CardAttribute, number> {

  constructor() { 
    super(AppDB.CARD_ATTRIBUTES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'type', header: 'Type', type: FieldType.string}
    ])
  }
  
  override getEntityName(entity: CardAttribute) {
    return entity.name;
  }
}
