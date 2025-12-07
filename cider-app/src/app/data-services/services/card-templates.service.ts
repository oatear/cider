import { Injectable } from '@angular/core';
import { CardTemplate } from '../types/card-template.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { DecksService } from './decks.service';
import { SaveService } from './save.service';

@Injectable({
  providedIn: 'root'
})
export class CardTemplatesService extends DecksChildService<CardTemplate, number> {

  constructor(decksService: DecksService, db: AppDB, private saveService: SaveService) {
    super(decksService, db, AppDB.CARD_TEMPLATES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'deckId', header: 'Deck ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text},
      {field: 'description', header: 'Description', type: FieldType.text},
      {field: 'html', header: 'HTML', type: FieldType.text, hidden: true},
      {field: 'css', header: 'CSS', type: FieldType.text, hidden: true}
    ]);
  }

  override async create(entity: CardTemplate, overrideParent?: boolean) {
    const result = await super.create(entity, overrideParent);
    // Trigger minimal save for template creation
    await this.saveService.minimalSave();
    return result;
  }

  override async update(id: number, entity: CardTemplate, overrideParent?: boolean) {
    const result = await super.update(id, entity, overrideParent);
    // Trigger minimal save for template update
    await this.saveService.minimalSave();
    return result;
  }

  override async delete(id: number) {
    const result = await super.delete(id);
    // Trigger minimal save for template deletion
    if (result) {
      await this.saveService.minimalSave();
    }
    return result;
  }

  override getEntityName(entity: CardTemplate) {
    return entity.name;
  }
}
