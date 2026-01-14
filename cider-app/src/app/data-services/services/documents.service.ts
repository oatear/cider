import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { Document } from '../types/document.type';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService extends IndexedDbService<Document, number> {

  constructor(db: AppDB) {
    super(db, AppDB.DOCUMENTS_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'name', header: 'Name', type: FieldType.text },
      { field: 'mime', header: 'Mime', type: FieldType.text },
      { field: 'content', header: 'Content', type: FieldType.text, hidden: true }
    ]);
  }
}
