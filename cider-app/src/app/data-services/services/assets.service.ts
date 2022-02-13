import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { GamesChildService } from '../indexed-db/games-child.service';
import { GamesService } from './games.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends GamesChildService<Asset, number> {

  constructor(gamesService: GamesService) {
    super(gamesService, AppDB.ASSETS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'file', header: 'File', type: FieldType.file}
    ]);
  }
  
  override getEntityName(entity: Asset) {
    return entity.name;
  }
}
