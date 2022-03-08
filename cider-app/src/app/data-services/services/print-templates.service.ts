import { Injectable } from '@angular/core';
import { PrintTemplate } from '../types/print-template.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { GamesChildService } from '../indexed-db/games-child.service';
import { GamesService } from './games.service';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplatesService extends GamesChildService<PrintTemplate, number>{

  constructor(gamesService: GamesService) {
    super(gamesService, AppDB.PRINT_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number},
      {field: 'name', header: 'Name', type: FieldType.text},
      {field: 'description', header: 'Description', type: FieldType.text},
      {field: 'html', header: 'HTML', type: FieldType.text},
      {field: 'css', header: 'CSS', type: FieldType.text}
    ]);
  }

  override getEntityName(entity: PrintTemplate) {
    return entity.name;
  }
}
