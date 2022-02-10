import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { FieldType } from '../types/entity-field.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends IndexedDbService<Asset, number> {

  constructor() {
    super(AppDB.ASSETS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number},
      {field: 'filename', header: 'Filename', type: FieldType.string}
    ], [
      {id: 1, filename: 'File Asset 1'},
      {id: 2, filename: 'File Asset 2'}
    ]);
  }
}
