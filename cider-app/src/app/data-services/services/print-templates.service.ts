import { Injectable } from '@angular/core';
import { PrintTemplate } from '../types/print-template.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/entity-field.type';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplatesService extends IndexedDbService<PrintTemplate, number>{

  constructor() {
    super(AppDB.PRINT_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'description', header: 'Description', type: FieldType.string},
      {field: 'html', header: 'HTML', type: FieldType.string},
      {field: 'css', header: 'CSS', type: FieldType.string}
    ]);
  }
}
