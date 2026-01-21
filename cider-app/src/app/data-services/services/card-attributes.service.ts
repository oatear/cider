import { Injectable } from '@angular/core';
import { AppDB } from '../indexed-db/db';
import { DecksChildService } from '../indexed-db/decks-child.service';
import { CardAttribute } from '../types/card-attribute.type';
import { FieldType } from '../types/field-type.type';
import { DecksService } from './decks.service';
import StringUtils from 'src/app/shared/utils/string-utils';
import { ElectronService } from '../electron/electron.service';
import { ProjectStateService } from './project-state.service';
import XlsxUtils from 'src/app/shared/utils/xlsx-utils';
import { PersistentPath } from '../types/persistent-path.type';
import { firstValueFrom, groupBy, mergeMap, debounceTime, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardAttributesService extends DecksChildService<CardAttribute, number> {

  constructor(decksService: DecksService, db: AppDB,
    private electronService: ElectronService,
    private projectStateService: ProjectStateService) {
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
    ]);

    this.electronService.getFileChanged().pipe(
      filter(path => path.endsWith('attributes.csv')),
      groupBy(path => path),
      mergeMap(group => group.pipe(debounceTime(300)))
    ).subscribe(path => this.handleFileChanged(path));
  }

  private async handleFileChanged(path: string) {
    const parts = path.split('/');
    if (parts.length < 2) return;
    const folderName = parts[parts.length - 2];

    const decks = await this.decksService.getAll();
    const deck = decks.find(d => StringUtils.toKebabCase(d.name) === folderName);

    if (deck) {
      console.log(`Syncing attributes for deck: ${deck.name} from external CSV change.`);
      await this.syncFromCsv(path, deck.id);
    }
  }

  private async syncFromCsv(path: string, deckId: number) {
    const homeUrl = await firstValueFrom(this.electronService.getProjectHomeUrl());
    if (!homeUrl) return;

    const persistentPath: PersistentPath = {
      path: path,
      bookmark: homeUrl.bookmark
    };

    const buffer = await this.electronService.readFile(persistentPath);
    if (!buffer) return;

    const blob: Blob = new Blob([new Uint8Array(buffer)], { type: 'text/csv' });
    const file: File = new File([blob], 'attributes.csv', { type: 'text/csv' });

    const fields = await this.getFields({ deckId });
    const lookups = await this.getLookups({ deckId });

    const entities = await XlsxUtils.entityImport(fields, lookups, file);

    this.projectStateService.setTrackingEnabled(false);
    try {
      await this.db.table(this.tableName).where({ deckId }).delete();
      await Promise.all(entities.map(entity => {
        (<any>entity)['deckId'] = deckId;
        return this.create(entity, true);
      }));
      await this.createSystemAttributes(deckId);
      console.log(`Synced ${entities.length} attributes for deck ${deckId}`);
    } catch (e) {
      console.error("Error syncing attributes from CSV", e);
    } finally {
      this.projectStateService.setTrackingEnabled(true);
    }
  }

  override getAll(equalityCriterias?: { [key: string]: any; }) {
    return super.getAll(equalityCriterias).then(attributes => {
      return attributes.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
  }

  override getEntityName(entity: CardAttribute) {
    return entity.name;
  }

  override create(entity: CardAttribute, overrideParent?: boolean | undefined): Promise<CardAttribute> {
    const normalizedType = (entity.type as string)?.toLowerCase().trim();
    if ((normalizedType === FieldType.dropdown || normalizedType === 'option') && entity.options) {
      if ((entity.type as string) !== FieldType.dropdown) {
        entity.type = FieldType.dropdown;
      }

      if (typeof entity.options === 'string') {
        const strOptions = entity.options as string;
        try {
          const parsed = JSON.parse(strOptions);
          if (Array.isArray(parsed)) {
            entity.options = parsed;
            return super.create(entity, overrideParent);
          }
        } catch (e) {
          // ignore error, treat as legacy string
        }

        const optionsList = strOptions.split('|').map(o => o.trim());

        entity.options = optionsList.map(o => {
          return { value: o, color: StringUtils.generateRandomColor() };
        });
      }
    }
    return super.create(entity, overrideParent);
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
          await this.update(existing.id, existing, true);
        }
      }
    }
  }
}
