import { Injectable } from '@angular/core';
import { Card } from '../types/card.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { CardAttributesService } from './card-attributes.service';
import { CardTemplatesService } from './card-templates.service';
import { EntityField } from '../types/entity-field.type';
import { DecksChildService as DecksChildService } from '../indexed-db/decks-child.service';
import { DecksService } from './decks.service';
import { CardAttribute } from '../types/card-attribute.type';
import StringUtils from 'src/app/shared/utils/string-utils';
import { SaveService } from './save.service';

@Injectable({
  providedIn: 'root'
})
export class CardsService extends DecksChildService<Card, number> {

  constructor(private attributesService: CardAttributesService,
    private cardTemplatesService: CardTemplatesService,
    decksService: DecksService, db: AppDB, private saveService: SaveService) {
    super(decksService, db, AppDB.CARDS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'deckId', header: 'Deck ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text, description: 'The name of the card'},
      {field: 'count', header: 'Count', type: FieldType.number, description: 'How many of this card appear in the deck'},
      {field: 'frontCardTemplateId', header: 'Front Template', type: FieldType.option, 
        service: <any>cardTemplatesService, description: "The card's front template"},
      {field: 'backCardTemplateId', header: 'Back Template', type: FieldType.option, 
        service: <any>cardTemplatesService, description: "The card's back template"}
    ]);
  }
  
  override async getFields(equalityCriterias?: {[key: string]: any;}) {
    const attributes = await this.attributesService.getAll(equalityCriterias);
    return this.fields.concat(attributes.map(attribute => this.cardAttributeToEntityField(attribute)));
  }

  async getFieldsUnfiltered(equalityCriterias?: {[key: string]: any;}) {
    const attributes = await this.attributesService.getAllUnfiltered(equalityCriterias);
    return this.fields.concat(attributes.map(attribute => this.cardAttributeToEntityField(attribute)));
  }

  private cardAttributeToEntityField(attribute: CardAttribute) {
    return {
      field: StringUtils.toKebabCase(attribute.name),
      header: attribute.name,
      type: attribute.type,
      description: attribute.description,
      options: attribute.options
    } as EntityField<Card>;
  }

  override getEntityName(entity: Card) {
    return entity.name;
  }

  override async create(entity: Card, overrideParent?: boolean) {
    const result = await super.create(entity, overrideParent);
    // Trigger minimal save for card creation
    await this.saveService.minimalSave();
    return result;
  }

  override async update(id: number, entity: Card, overrideParent?: boolean) {
    const result = await super.update(id, entity, overrideParent);
    // Trigger minimal save for card update
    await this.saveService.minimalSave();
    return result;
  }

  override async delete(id: number) {
    const result = await super.delete(id);
    // Trigger minimal save for card deletion
    if (result) {
      await this.saveService.minimalSave();
    }
    return result;
  }
}
