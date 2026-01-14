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
import { DropdownOption } from '../types/dropdown-option.type';

@Injectable({
  providedIn: 'root'
})
export class CardsService extends DecksChildService<Card, number> {

  constructor(private attributesService: CardAttributesService,
    private cardTemplatesService: CardTemplatesService,
    decksService: DecksService, db: AppDB) {
    super(decksService, db, AppDB.CARDS_TABLE, [
      { field: 'id', header: 'ID', type: FieldType.numeric, hidden: true },
      { field: 'deckId', header: 'Deck ID', type: FieldType.numeric, hidden: true }
    ]);
  }

  override async getFields(equalityCriterias?: { [key: string]: any; }) {
    const attributes = await this.attributesService.getAll(equalityCriterias);
    return this.fields.concat(attributes.map(attribute => this.cardAttributeToEntityField(attribute)));
  }

  async getFieldsUnfiltered(equalityCriterias?: { [key: string]: any; }) {
    const attributes = await this.attributesService.getAllUnfiltered(equalityCriterias);
    return this.fields.concat(attributes.map(attribute => this.cardAttributeToEntityField(attribute)));
  }



  private cardAttributeToEntityField(attribute: CardAttribute) {
    let options: DropdownOption[] = [];

    if (Array.isArray(attribute.options)) {
      // Legacy: string[] or DropdownOption[]? 
      // We can assume if it has object structure it's DropdownOption, else string
      if (attribute.options.length > 0 && typeof attribute.options[0] === 'string') {
        options = (attribute.options as unknown as string[]).map(o => ({ value: o, color: '#FFFFFF' }));
      } else {
        options = attribute.options as DropdownOption[];
      }
    } else if (attribute.options) {
      // String format
      const optsStr = attribute.options as string;
      if (optsStr.trim().startsWith('[')) {
        try {
          const parsed = JSON.parse(optsStr);
          if (Array.isArray(parsed)) {
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
              options = parsed.map((o: string) => ({ value: o, color: '#FFFFFF' }));
            } else {
              options = parsed;
            }
          }
        } catch (e) {
          // Fallback to comma split if JSON parse fails?
          options = optsStr.split(',').map(o => ({ value: o.trim(), color: '#FFFFFF' }));
        }
      } else {
        options = optsStr.split(',').map(o => ({ value: o.trim(), color: '#FFFFFF' }));
      }
    }

    if (attribute.isSystem) {
      if (attribute.name === 'Name') {
        return {
          field: 'name',
          header: attribute.name,
          type: attribute.type,
          description: attribute.description,
          width: attribute.width
        } as EntityField<Card>;
      }
      if (attribute.name === 'Count') {
        return {
          field: 'count',
          header: attribute.name,
          type: attribute.type,
          description: attribute.description,
          width: attribute.width
        } as EntityField<Card>;
      }
      if (attribute.name === 'Front Template') {
        return {
          field: 'frontCardTemplateId',
          header: attribute.name,
          type: attribute.type,
          service: <any>this.cardTemplatesService,
          description: attribute.description,
          width: attribute.width
        } as EntityField<Card>;
      }
      if (attribute.name === 'Back Template') {
        return {
          field: 'backCardTemplateId',
          header: attribute.name,
          type: attribute.type,
          service: <any>this.cardTemplatesService,
          description: attribute.description,
          width: attribute.width
        } as EntityField<Card>;
      }
    }

    return {
      field: StringUtils.toKebabCase(attribute.name),
      header: attribute.name,
      type: attribute.type,
      description: attribute.description,
      options: options,
      width: attribute.width
    } as EntityField<Card>;
  }

  override getEntityName(entity: Card) {
    return entity.name;
  }
}
