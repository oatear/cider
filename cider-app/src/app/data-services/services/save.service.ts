import { Injectable, Injector } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { ElectronService } from '../electron/electron.service';
import { CardsService } from './cards.service';
import { CardAttributesService } from './card-attributes.service';
import { CardTemplatesService } from './card-templates.service';
import { DecksService } from './decks.service';
import { AssetsService } from './assets.service';
import { DocumentsService } from './documents.service';

@Injectable({
  providedIn: 'root'
})
export class SaveService {

  constructor(private injector: Injector) {
  }

  private async performSave(includeAssets: boolean | null = true, isManualSave: boolean = false): Promise<boolean> {
    try {
      const localStorageService = this.injector.get(LocalStorageService);
      const electronService = this.injector.get(ElectronService);
      const isProjectOpen = electronService.getIsProjectOpen().getValue();

      // Manual saves always work, auto saves check the setting
      if (!isProjectOpen) {
        return false;
      }

      if (!isManualSave) {
        const autoSaveEnabled = localStorageService.getAutoSave();
        if (!autoSaveEnabled) {
          return false;
        }
      }

      const projectHomeUrl = await firstValueFrom(electronService.getProjectHomeUrl());
      if (!projectHomeUrl) {
        return false;
      }

      // Import utils dynamically
      const xlsxUtils = (await import("../../shared/utils/xlsx-utils")).default;
      const stringUtils = (await import("../../shared/utils/string-utils")).default;

      const documentsService = this.injector.get(DocumentsService);
      const decksService = this.injector.get(DecksService);
      const cardsService = this.injector.get(CardsService);
      const cardAttributesService = this.injector.get(CardAttributesService);
      const cardTemplatesService = this.injector.get(CardTemplatesService);

      let assets: any[] = [];
      let documents;
      let decks;

      // Prepare promises
      const docsPromise = documentsService.getAll();
      const decksPromise = decksService.getAll().then((decksList: any) =>
        Promise.all(decksList.map(async (deck: any) => {
          // cards
          const [cardFields, cardLookups, cardRecords] = await Promise.all([
            cardsService.getFields({ deckId: deck.id }),
            cardsService.getLookups({ deckId: deck.id }),
            cardsService.getAll({ deckId: deck.id })
          ]);
          const cardsCsv = xlsxUtils.entityExport(cardFields, cardLookups, cardRecords);
          // attributes
          const [attributeFields, attributeLookups, attributeRecords] = await Promise.all([
            cardAttributesService.getFields({ deckId: deck.id }),
            cardAttributesService.getLookups({ deckId: deck.id }),
            cardAttributesService.getAll({ deckId: deck.id })
          ]);
          const attributesCsv = xlsxUtils.entityExport(attributeFields, attributeLookups, attributeRecords);
          // templates
          const templates = await cardTemplatesService.getAll({ deckId: deck.id });
          return {
            name: stringUtils.toKebabCase(deck.name),
            cardsCsv: cardsCsv,
            attributesCsv: attributesCsv,
            templates: templates
          };
        })));

      if (includeAssets) {
        const assetsService = this.injector.get(AssetsService);
        assets = await assetsService.getAll();
      }

      [documents, decks] = await Promise.all([docsPromise, decksPromise]);

      return await electronService.saveProject(includeAssets === null ? null : assets, documents, decks as any).then(() => {
        electronService.setProjectUnsaved(false);
        return true;
      });

    } catch (error) {
      console.error('Error in performSave:', error);
      return false;
    }
  }

  async minimalSave(): Promise<void> {
    console.log('Minimal auto-save triggered');
    const success = await this.performSave(null); // null means skip assets entirely
    if (success) {
      console.log('Minimal auto-save completed successfully');
    }
  }

  async fullSave(): Promise<void> {
    console.log('Full auto-save triggered');
    const success = await this.performSave(true);
    if (success) {
      console.log('Full auto-save completed successfully');
    }
  }

  async manualSave(): Promise<boolean> {
    console.log('Manual save triggered');
    return await this.performSave(true, true); // true for manual save flag
  }
}
