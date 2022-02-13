import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { GamesChildService } from '../indexed-db/games-child.service';
import { CardAttribute } from '../types/card-attribute.type';
import { FieldType } from '../types/field-type.type';
import { GamesService } from './games.service';

@Injectable({
  providedIn: 'root'
})
export class CardAttributesService extends GamesChildService<CardAttribute, number> {

  constructor(gamesService: GamesService) { 
    super(gamesService, AppDB.CARD_ATTRIBUTES_TABLE, [
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
