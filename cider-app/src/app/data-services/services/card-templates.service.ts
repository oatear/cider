import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends IndexedDbService<CardTemplate, number> {

  constructor() {
    super(AppDB.CARD_TEMPLATES_TABLE);
  }
}
