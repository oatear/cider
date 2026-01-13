import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { CardAttribute } from '../types/card-attribute.type';
import { FieldType } from '../types/field-type.type';
import { DecksService } from './decks.service';

@Injectable({
  providedIn: 'root'
})
export class CardAttributesService extends DecksChildService<CardAttribute, number> {

  constructor(decksService: DecksService, db: AppDB) {
    super(decksService, db, AppDB.CARD_ATTRIBUTES_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'deckId', header: 'Deck ID', type: FieldType.numeric, hidden: true },
      { field: 'name', header: 'Name', type: FieldType.text },
      { field: 'description', header: 'Description', type: FieldType.text },
      {
        field: 'type', header: 'Type', type: FieldType.dropdown,
        options: [
          { value: FieldType.text, color: '#FFFFFF' },
          { value: FieldType.dropdown, color: '#FFFFFF' },
          { value: FieldType.numeric, color: '#FFFFFF' },
          { value: FieldType.checkbox, color: '#FFFFFF' }
        ]
      },
      { field: 'options', header: 'Options', type: FieldType.dropdownOptions, visible: (e) => e.type === FieldType.dropdown },
      { field: 'width', header: 'Width', type: FieldType.numeric },
      { field: 'order', header: 'Order', type: FieldType.numeric }
    ])
  }

  override getAll(equalityCriterias?: { [key: string]: any; }) {
    return super.getAll(equalityCriterias).then(attributes => {
      return attributes.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  }

  override getEntityName(entity: CardAttribute) {
    return entity.name;
  }

  async createSystemAttributes(deckId: number) {
    const inherent = [
      { name: 'Name', type: FieldType.text, description: 'The name of the card', isSystem: true, order: -4 },
      { name: 'Count', type: FieldType.numeric, description: 'How many of this card appear in the deck', isSystem: true, order: -3 },
      { name: 'Front Template', type: FieldType.dropdown, description: "The card's front template", isSystem: true, order: -2 },
      { name: 'Back Template', type: FieldType.dropdown, description: "The card's back template", isSystem: true, order: -1 }
    ];

    for (const attr of inherent) {
      const existing = await this.db.table(this.tableName).where({ deckId: deckId, name: attr.name }).first();
      if (!existing) {
        await this.create(<any>{
          deckId: deckId,
          name: attr.name,
          type: attr.type,
          description: attr.description,
          options: [],
          width: 135,
          order: attr.order,
          isSystem: true
        }, true);
      } else {
        if (!existing.isSystem) {
          existing.isSystem = true;
          await this.update(existing.id, existing);
        }
      }
    }
  }
}
