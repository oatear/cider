import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends IndexedDbService<Asset, number> {

  constructor() {
    super(AppDB.ASSETS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'filename', header: 'Filename', type: FieldType.string}
    ]);
  }
  
  override getEntityName(entity: Asset) {
    return entity.filename;
  }
}
