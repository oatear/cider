import { Injectable } from '@angular/core';
import { Asset } from '../types/asset.type';
import { FieldType } from '../types/entity-field.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends InMemoryService<Asset, number> {

  constructor() {
    super([
      {field: 'id', header: 'ID', type: FieldType.number},
      {field: 'filename', header: 'Filename', type: FieldType.string}
    ], [
      {id: 1, filename: 'File Asset 1'},
      {id: 2, filename: 'File Asset 2'}
    ]);
  }
}
