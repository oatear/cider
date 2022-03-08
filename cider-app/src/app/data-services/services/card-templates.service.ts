import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { GamesChildService } from '../indexed-db/games-child.service';
import { GamesService } from './games.service';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends GamesChildService<CardTemplate, number> {

  constructor(gamesService: GamesService) {
    super(gamesService, AppDB.CARD_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text},
      {field: 'description', header: 'Description', type: FieldType.text},
      {field: 'html', header: 'HTML', type: FieldType.text, hidden: true},
      {field: 'css', header: 'CSS', type: FieldType.text, hidden: true}
    ]);
  }

  override getEntityName(entity: CardTemplate) {
    return entity.name;
  }
}
