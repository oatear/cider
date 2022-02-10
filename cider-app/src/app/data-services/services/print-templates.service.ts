import { Injectable } from '@angular/core';
import { PrintTemplate } from '../types/print-template.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';

@Injectable({
  providedIn: 'root'
})
export class PrintTemplatesService extends IndexedDbService<PrintTemplate, number>{

  constructor() {
    super(AppDB.PRINT_TEMPLATES_TABLE);
  }
}
