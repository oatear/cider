import { Injectable } from '@angular/core';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { Document } from '../types/document.type';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService extends IndexedDbService<Document, number> {

  constructor(db: AppDB) { 
    super(db, AppDB.DOCUMENTS_TABLE, [

    ]);
  }
}
