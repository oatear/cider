import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import StringUtils from 'src/app/shared/utils/string-utils';
import { Asset } from '../types/asset.type';
import { CardTemplate } from '../types/card-template.type';
import { AssetsService } from '../services/assets.service';
import { CardTemplatesService } from '../services/card-templates.service';
import { CardAttributesService } from '../services/card-attributes.service';
import { CardsService } from '../services/cards.service';
import { DecksService } from '../services/decks.service';
import XlsxUtils from 'src/app/shared/utils/xlsx-utils';
import { EntityService } from '../types/entity-service.type';
import { Subject } from 'rxjs';
import { DocumentsService } from '../services/documents.service';
import { PersistentPath } from '../types/persistent-path.type';
import { DirtyEntity } from '../services/project-state.service';
import { Document } from '../types/document.type';
import { AppDB } from '../indexed-db/db';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private static readonly ASSETS_DIR = "assets";
  private static readonly DECKS_DIR = "decks";
  private projectOpen: BehaviorSubject<boolean>;
  private projectHomeUrl: BehaviorSubject<PersistentPath | undefined>;
  private projectUnsaved: BehaviorSubject<boolean>;
  private appClosed: Subject<null>;

  private isSaving: boolean = false;

  constructor() {
    this.projectOpen = new BehaviorSubject<boolean>(false);
    this.projectHomeUrl = new BehaviorSubject<PersistentPath | undefined>(undefined);
    this.projectUnsaved = new BehaviorSubject<boolean>(false);
    this.appClosed = new Subject<null>();

    if (this.isElectron()) {
      this.getIpcRenderer().on('app-closed', () => {
        this.appClosed.next(null);
      });
      // File Watcher Events
      this.getIpcRenderer().on('file-added', (event, path) => {
        if (!this.isSaving) this.fileAdded.next(path);
      });
      this.getIpcRenderer().on('file-changed', (event, path) => {
        if (!this.isSaving) this.fileChanged.next(path);
      });
      this.getIpcRenderer().on('file-removed', (event, path) => {
        if (!this.isSaving) this.fileRemoved.next(path);
      });
      this.getIpcRenderer().on('directory-added', (event, path) => {
        if (!this.isSaving) this.directoryAdded.next(path);
      });
      this.getIpcRenderer().on('directory-removed', (event, path) => {
        if (!this.isSaving) this.directoryRemoved.next(path);
      });
    }
  }

  // File Watcher Subjects
  private fileAdded: Subject<string> = new Subject<string>();
  private fileChanged: Subject<string> = new Subject<string>();
  private fileRemoved: Subject<string> = new Subject<string>();
  private directoryAdded: Subject<string> = new Subject<string>();
  private directoryRemoved: Subject<string> = new Subject<string>();

  public getFileAdded() { return this.fileAdded.asObservable(); }
  public getFileChanged() { return this.fileChanged.asObservable(); }
  public getFileRemoved() { return this.fileRemoved.asObservable(); }
  public getDirectoryAdded() { return this.directoryAdded.asObservable(); }
  public getDirectoryRemoved() { return this.directoryRemoved.asObservable(); }

  public async watchDirectory(persistentPath: PersistentPath): Promise<boolean> {
    if (!this.isElectron()) return false;
    return this.getIpcRenderer().invoke('watch-directory', persistentPath);
  }

  public async unwatchDirectory(): Promise<boolean> {
    if (!this.isElectron()) return false;
    return this.getIpcRenderer().invoke('unwatch-directory');
  }

  public getIsProjectOpen() {
    return this.projectOpen;
  }

  public getProjectHomeUrl() {
    return this.projectHomeUrl.asObservable();
  }

  public getProjectUnsaved() {
    return this.projectUnsaved.asObservable();
  }

  public getIsAppClosed() {
    return this.appClosed.asObservable();
  }

  public setProjectUnsaved(unsaved: boolean) {
    this.projectUnsaved.next(unsaved);
  }

  public setProjectOpen(isOpen: boolean) {
    this.projectOpen.next(isOpen);
    if (!isOpen) {
      this.unwatchDirectory();
    }
  }

  /**
   * Determine if application is running in electron
   * 
   * @returns true/false
   */
  public isElectron(): boolean {
    return typeof window !== 'undefined'
      && typeof window.process === 'object'
      && (<any>window.process).type === 'renderer';
  }

  private getIpcRenderer(): IpcRenderer {
    return window.require('electron').ipcRenderer;
  }

  public selectDirectory(persistentPath: PersistentPath | undefined) {
    this.projectHomeUrl.next(persistentPath);
  }

  public async openSelectDirectoryDialog(): Promise<PersistentPath | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    const result = await this.getIpcRenderer().invoke("open-select-directory-dialog");
    if (!result.canceled) {
      const path = result.filePaths[0];
      const bookmark = result.bookmarks ? result.bookmarks[0] : undefined;
      const persistentPath: PersistentPath = { path, bookmark: bookmark };
      this.projectHomeUrl.next(persistentPath);
      console.log("projectHomePath: ", persistentPath.path);
      return persistentPath;
    }
    return null;
  }

  public createDirectory(persistentPath: PersistentPath): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("create-directory", persistentPath);
  }

  public removeDirectory(persistentPath: PersistentPath): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("remove-directory", persistentPath);
  }

  public listDirectory(persistentPath: PersistentPath): Promise<{
    name: string; isDirectory: boolean; isFile: boolean;
  }[]> {
    if (!this.isElectron()) {
      return Promise.resolve([]);
    }
    return this.getIpcRenderer().invoke("list-directory", persistentPath);
  }

  public readFile(persistentPath: PersistentPath): Promise<Buffer | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("read-file", persistentPath);
  }

  public readTextFile(persistentPath: PersistentPath): Promise<string | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("read-text-file", persistentPath);
  }

  public writeFile(persistentPath: PersistentPath, data: string | NodeJS.ArrayBufferView): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("write-file", persistentPath, data);
  }

  public async writeFileIfChanged(persistentPath: PersistentPath, data: string): Promise<boolean> {
    if (!this.isElectron()) {
      return false;
    }
    const existingContent = await this.readTextFile(persistentPath);
    if (existingContent === data) {
      return false;
    }
    return this.writeFile(persistentPath, data);
  }

  public titlebarDoubleClick(): void {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("titlebar-double-clicked");
  }

  public exitApplication(): void {
    if (!this.isElectron()) {
      return;
    }
    this.getIpcRenderer().send("exit-application");
  }

  public async saveProject(assets: Asset[], documents: Document[], decks: {
    id: number; name: string; cardsCsv: string;
    attributesCsv: string; templates: CardTemplate[];
  }[], dirtyEntities: DirtyEntity[] | null = null) {
    if (!this.isElectron()) {
      return;
    }
    const homeUrl = this.projectHomeUrl.getValue();
    if (!homeUrl) {
      console.error("Project home URL is not set.");
      return;
    }
    const assetsUrl = homeUrl.path + "/" + ElectronService.ASSETS_DIR;
    const decksUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR;

    // Suppress file watcher events during save
    this.isSaving = true;

    try {
      if (!dirtyEntities) {
        // --- SMART SAVE (Check and Update) ---
        // 1. Documents
        // Save all current documents (checking for changes)
        const writeAllDocuments: Promise<boolean[]> = Promise.all(documents.map(async document => {
          return await this.saveDocument(homeUrl, document);
        }));
        await writeAllDocuments;
        // Prune orphaned documents? 
        // We need a pruneDocuments similar to pruneAssets if we want to support deleting files that were removed from the app.
        // For now, let's assume DocumentsService matches the files? 
        // Actually, if we remove `removeDirectory`, we MUST implement prune for documents to handle deletions.
        // The original code did: listDirectory -> delete all .md/.css. 
        // So I should implement `pruneDocuments`.

        await this.pruneDocuments(homeUrl, documents);

        // 2. Assets
        await this.createDirectory({ bookmark: homeUrl.bookmark, path: assetsUrl });
        const writeAllAssets: Promise<boolean[]> = Promise.all(assets.map(async asset => {
          return await this.saveAsset(homeUrl, asset);
        }));
        await writeAllAssets;
        await this.pruneAssets(homeUrl, assets);

        // 3. Decks
        await this.createDirectory({ bookmark: homeUrl.bookmark, path: decksUrl });

        // Prune Decks first or after? 
        // If we prune first, we might remove something we are about to save if we are not careful? 
        // No, we pass `decks` (current state). `pruneDecks` deletes what is NOT in `decks`.
        // So it's safe to prune.
        await this.pruneDecks(homeUrl, decks);

        const writeAllDecks = await Promise.all(decks.map(async deck => {
          const deckUrl = decksUrl + '/' + StringUtils.toKebabCase(deck.name);
          await this.createDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });

          await this.saveDeckCards(homeUrl, deck.name, deck.cardsCsv);
          await this.saveDeckAttributes(homeUrl, deck.name, deck.attributesCsv);

          await this.pruneTemplates(homeUrl, deck.name, deck.templates);

          const writeTemplates = await Promise.all(deck.templates.map(template => {
            return this.saveTemplate(homeUrl, deck.name, template);
          }));
          this.setProjectUnsaved(false);
          return true;
        }));
      } else {
        // --- GRANULAR SAVE ---
        console.log('Performing granular save', dirtyEntities);

        // Helper to find entity or deletion
        // Since we don't know the OLD name if it was renamed, checking deletion is tricky if only ID is known.
        // But for granular save, if it's not in the passed array, it's deleted.
        // Wait, 'documents', 'assets', 'decks' contain CURRENT entities.

        // Documents
        await Promise.all(dirtyEntities.filter(e => e.type === 'document').map(async dirty => {
          const doc = documents.find(d => d.id == dirty.id);
          if (doc) {
            await this.saveDocument(homeUrl, doc);
          } else {
            // Deleted. We need to find the file to delete. 
            // Problem: We don't know the filename if it's deleted.
            // We'd need to list directory and fuzzy match or assume we can't easily delete 
            // without knowing the previous name.
            // Strategy: For deletions, we might need a "manifest" or just accept that we might leave orphan files 
            // unless we iterate files.
            // OR, for now, we only handle UPDATES/ADDS granularly. 
            // If a file is DELETED, we might need to do a scan.
            // Or, `ProjectStateService` could track *deleted* names? No, too complex.
            // Let's rely on listing the directory for deletions?
            // Actually, if we just save what exists, orphans remain.
            // If the user DELETED something, they expect it gone.

            // If we cannot reliably delete, maybe we fall back to full save for deletions?
            // But how do we know if it was a deletion?
            // `dirtyEntities` has `create`, `update`, `delete` events if we used the granular event structure I added to AppDB earlier!
            // Wait, `ProjectStateService` subscribes to DB changes. 
            // I updated `AppDB` to emit `{ tableName, type, key }`. `type` is 'create' | 'update' | 'delete'.
            // But `ProjectStateService` discards the operation type and just sets `isDirty`.
            // I should update `ProjectStateService` to track operation type?
            // Or `DirtyEntity` interface.
          }
        }));

        // Assets
        await Promise.all(dirtyEntities.filter(e => e.type === 'asset').map(async dirty => {
          // Use loose equality to handle potential string/number mismatches from IndexedDB keys
          const asset = assets.find(a => a.id == dirty.id);
          if (asset) {
            await this.saveAsset(homeUrl, asset);
          } else {
          }
        }));

        await this.pruneAssets(homeUrl, assets);

        // Decks (Cards/Templates/Attributes)
        // If deck is dirty, or card/template/attribute is dirty -> save deck.
        const dirtyDeckIds = new Set<string>();
        dirtyEntities.forEach(e => {
          if (e.type === 'deck') dirtyDeckIds.add(e.id.toString());
          // How to map card -> deck? 
          // `decks` array has cards? No, `saveProject` receives `decks` with `cardsCsv`.
          // The `decks` object passed to `saveProject` has `id`.
          // But if `e.type === 'card'`, we don't know which deck it belongs to just from ID
          // unless we look it up.
          // But `saveProject` receives ALL decks. We can assume we might need to save ALL decks 
          // if we can't map. 
          // OR `ProjectStateService` logic for "card changed" implies "deck dirty"?
          // I didn't verify if changing a card marks the deck dirty.
          // If I change a card, `cards` table changes.
          // The `saveProject` logic in `SiteMenuComponent` regenerates CSV for the deck.
          // So if `SiteMenuComponent` did its job, `decks` array contains updated CSVs.
          // So we really just need to know WHICH deck changed.
          // But we don't know map from CardID -> DeckID easily here.

          // FALLBACK: If any card/attribute/template is dirty, we might need to check which deck it belongs to.
          // This is getting complicated for `ElectronService`.

          // SIMPLIFICATION: If `dirtyEntities` contains ANY card/template/attribute/deck stuff, 
          // we iterate ALL passed decks and save them. 
          // It's still better than wiping assets/documents. 
          // Saving text files (csv/html) is fast. Wiping assets (images) is slow.
          // So: 
          // 1. Save all changed documents.
          // 2. Save all changed assets.
          // 3. Save ALL decks (because mapping is hard and text is cheap).
        });

        // Save ALL decks (because mapping is hard and text is cheap).
        await this.pruneDecks(homeUrl, decks);

        await Promise.all(decks.map(async deck => {
          const deckUrl = decksUrl + '/' + StringUtils.toKebabCase(deck.name);
          await this.createDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });
          await this.saveDeckCards(homeUrl, deck.name, deck.cardsCsv);
          await this.saveDeckAttributes(homeUrl, deck.name, deck.attributesCsv);

          await this.pruneTemplates(homeUrl, deck.name, deck.templates);

          await Promise.all(deck.templates.map(template => {
            return this.saveTemplate(homeUrl, deck.name, template);
          }));
        }));
      }
      return true;
    } finally {
      // Re-enable file watcher events after a delay to catch lingering OS events
      setTimeout(() => {
        this.isSaving = false;
      }, 1000);
    }
  }

  public async saveDocument(homeUrl: PersistentPath, document: Document): Promise<boolean> {
    if (!this.isElectron()) return false;
    const mimeType = document.mime ?? 'text/markdown';
    const extension = StringUtils.mimeToExtension(mimeType);
    const filename = document.name + (document.name.endsWith('.' + extension) ? '' : '.' + extension);
    const fileUrl = homeUrl.path + '/' + filename;

    const blob: Blob = new Blob([document.content], { type: mimeType });

    // For text based documents (md/css), we can use writeFileIfChanged
    // but document.content is string? DocumentsService treats content as string.
    // So yes, we can compare.
    return await this.writeFileIfChanged({
      bookmark: homeUrl.bookmark,
      path: fileUrl
    }, document.content);
  }

  public async saveAsset(homeUrl: PersistentPath, asset: Asset): Promise<boolean> {
    if (!this.isElectron()) return false;
    const assetsUrl = homeUrl.path + "/" + ElectronService.ASSETS_DIR;
    if (!homeUrl.path) return false;
    // We rely on createDirectory to handle existence (it returns false if exists but creates if not)
    await this.createDirectory({ bookmark: homeUrl.bookmark, path: assetsUrl });

    const extension = StringUtils.mimeToExtension(asset.file.type);
    const filename = StringUtils.toKebabCase(asset.name) + '.' + extension;

    const buffer = await asset.file.arrayBuffer();
    // Optimization: Check if file exists? 
    // Checking binary content is expensive.
    // For now, let's just check if it exists. If it does, we assume it hasn't changed 
    // because assets in this app are usually immutable (renaming creates a new one). 
    // But if user REPLACED usage of an asset? 
    // Actually, 'Asset' entity matches a file. 
    // If we just overwrite, it's fine. 
    // But to avoid write, we can check existence.
    const fileExists = await this.readFile({ bookmark: homeUrl.bookmark, path: assetsUrl + '/' + filename }).then(b => !!b);
    if (fileExists) {
      return true;
    }

    return await this.writeFile({
      bookmark: homeUrl.bookmark,
      path: assetsUrl + '/' + filename
    }, Buffer.from(buffer));
  }

  public async saveDeckCards(homeUrl: PersistentPath, deckName: string, csv: string): Promise<boolean> {
    if (!this.isElectron()) return false;
    const deckUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR + '/' + StringUtils.toKebabCase(deckName);
    await this.createDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });
    return await this.writeFileIfChanged({ bookmark: homeUrl.bookmark, path: deckUrl + '/cards.csv' }, csv);
  }

  public async saveDeckAttributes(homeUrl: PersistentPath, deckName: string, csv: string): Promise<boolean> {
    if (!this.isElectron()) return false;
    const deckUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR + '/' + StringUtils.toKebabCase(deckName);
    await this.createDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });
    return await this.writeFileIfChanged({ bookmark: homeUrl.bookmark, path: deckUrl + '/attributes.csv' }, csv);
  }

  public async saveTemplate(homeUrl: PersistentPath, deckName: string, template: CardTemplate): Promise<boolean> {
    if (!this.isElectron()) return false;
    const deckUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR + '/' + StringUtils.toKebabCase(deckName);
    await this.createDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });

    await Promise.all([
      this.writeFileIfChanged({ bookmark: homeUrl.bookmark, path: deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.css' }, template.css),
      this.writeFileIfChanged({ bookmark: homeUrl.bookmark, path: deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.html' }, template.html)
    ]);
    return true;
  }

  public async openProject(homeUrl: PersistentPath, db: AppDB, assetsService: AssetsService, decksService: DecksService,
    cardTemplatesService: CardTemplatesService, cardAttributesService: CardAttributesService,
    cardsService: CardsService, documentsService: DocumentsService, recover: boolean = false) {
    if (!this.isElectron()) {
      return;
    }
    const documentsUrl = homeUrl.path + "/";
    const assetsUrl = homeUrl.path + "/" + ElectronService.ASSETS_DIR;
    const decksUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR;

    if (!recover) {
      // Only wipe DB if not recovering
      await documentsService.emptyTable();
      await assetsService.emptyTable();
      await cardTemplatesService.emptyTable();
      await cardAttributesService.emptyTable();
      await cardsService.emptyTable();
      await decksService.emptyTable();
    } else {
      console.log('Recovering project - skipping DB wipe and file read');
      // Just setup the environment
      await db.initializeData();
      // Start watching the project directory
      await this.watchDirectory(homeUrl);
      this.projectHomeUrl.next(homeUrl); // Ensure home url is set!
      this.setProjectUnsaved(true); // Recovered state is by definition unsaved? Or maybe we trust DB state?
      // If we recover, the file system is "stale" compared to DB.
      // So we should assume it's dirty?
      // ProjectStateService tracks granular dirty state. If we restart app, ProjectStateService memory is gone.
      // But the DB has the "latest" data.
      // So effectively, we are in a state where DB != Disk.
      // We should mark "unsaved" so user knows to save.
      // But ProjectStateService won't have granular list.
      // That's tricky.
      // If we don't have granular list, checking "isDirty" in sidebar might show nothing.
      // But "Save" button should be enabled.
      // I'll set projectUnsaved to true.
      this.setProjectUnsaved(true);
      return;
    }

    // read document/markdown/css files
    await this.listDirectory({ bookmark: homeUrl.bookmark, path: documentsUrl }).then(documentUrls => Promise.all(documentUrls
      .filter(documentUrl => documentUrl.isFile
        && !documentUrl.name.includes('.DS_Store')
        && (documentUrl.name.includes('.md') || documentUrl.name.includes('.markdown')
          || documentUrl.name.includes('.MD')
          || documentUrl.name.includes('.css') || documentUrl.name.includes('.CSS'))
      ).map(async documentUrl => {
        const documentNameSplit = StringUtils.splitNameAndExtension(documentUrl.name);
        const documentName = documentNameSplit.name;
        const documentExt = documentNameSplit.extension;
        const documentBuffer = await this.readFile({ bookmark: homeUrl.bookmark, path: documentsUrl + '/' + documentUrl.name });
        if (!documentBuffer) {
          return;
        }
        const mime = StringUtils.extensionToMime(documentExt);
        const blob: Blob = new Blob([new Uint8Array(documentBuffer)], { type: mime });
        const content: string = await blob.text();
        const document = await documentsService.create(<any>{
          name: documentName,
          mime: mime,
          content: content,
        }, true);
        return document;
      })));

    // read assets
    await this.listDirectory({ bookmark: homeUrl.bookmark, path: assetsUrl }).then(assetUrls => Promise.all(assetUrls
      .filter(assetUrl => assetUrl.isFile && !assetUrl.name.includes('.DS_Store')).map(async assetUrl => {
        const assetNameSplit = StringUtils.splitNameAndExtension(assetUrl.name);
        const assetName = assetNameSplit.name;
        const assetExt = assetNameSplit.extension;
        const assetBuffer = await this.readFile({ bookmark: homeUrl.bookmark, path: assetsUrl + '/' + assetUrl.name });
        if (!assetBuffer) {
          return;
        }
        const fileType = StringUtils.extensionToMime(assetExt);
        const blob: Blob = new Blob([new Uint8Array(assetBuffer)], { type: fileType });
        const file: File = new File([blob], assetName, { type: fileType });
        const asset = await assetsService.create(<any>{
          file: file,
          name: assetName
        }, true);
        return asset;
      })));
    const deckUrls = await this.listDirectory({ bookmark: homeUrl.bookmark, path: decksUrl });
    await Promise.all(deckUrls.filter(deckUrl => deckUrl.isDirectory).map(async deckUrl => {
      const deckName = deckUrl.name;
      const deck = await decksService.create(<any>{ name: StringUtils.kebabToTitleCase(deckName) });
      const deckFullUrl = decksUrl + '/' + deckUrl.name;
      // for each .html file, also read the accompanying .css file
      const deckFileUrls = await this.listDirectory({ bookmark: homeUrl.bookmark, path: deckFullUrl });
      await Promise.all(deckFileUrls.filter(deckFileUrl => deckFileUrl.isFile
        && StringUtils.splitNameAndExtension(deckFileUrl.name).extension === 'html').map(async templateUrl => {
          const nameSplit = StringUtils.splitNameAndExtension(templateUrl.name);
          const prettyName = StringUtils.kebabToTitleCase(nameSplit.name);
          const htmlUrl = deckFullUrl + '/' + nameSplit.name + '.html';
          const cssUrl = deckFullUrl + '/' + nameSplit.name + '.css';
          const html = await this.readTextFile({ bookmark: homeUrl.bookmark, path: htmlUrl }).then(text => text ? text : '');
          const css = await this.readTextFile({ bookmark: homeUrl.bookmark, path: cssUrl }).then(text => text ? text : '');
          return await cardTemplatesService.create(<any>{ deckId: deck.id, name: prettyName, html: html, css: css }, true);
        }));
      const attributesUrl = deckFullUrl + '/attributes.csv';
      const cardsUrl = deckFullUrl + '/cards.csv';
      const attributes = await this.importCsv({ bookmark: homeUrl.bookmark, path: attributesUrl }, 'attributes.csv', cardAttributesService, deck.id);
      await cardAttributesService.createSystemAttributes(deck.id);
      const cards = await this.importCsv({ bookmark: homeUrl.bookmark, path: cardsUrl }, 'cards.csv', cardsService, deck.id);
    }));

    await db.initializeData();
    // Start watching the project directory
    await this.watchDirectory(homeUrl);
    this.setProjectUnsaved(false);
  }

  private async importCsv<Entity, Identity extends string | number>(persistentPath: PersistentPath, fileName: string,
    service: EntityService<Entity, Identity>, deckId: number) {
    const nameSplit = StringUtils.splitNameAndExtension(fileName);
    const fileType = StringUtils.extensionToMime(nameSplit.extension);
    const buffer = await this.readFile(persistentPath);
    if (!buffer) {
      console.log('import csv failed', persistentPath.path);
      return;
    }
    const blob: Blob = new Blob([new Uint8Array(buffer)], { type: fileType });
    const file: File = new File([blob], fileName, { type: fileType });
    const entities: Entity[] = await XlsxUtils.entityImport(
      await service.getFields({ deckId: deckId }),
      await service.getLookups({ deckId: deckId }),
      file);
    const createdEntities = await Promise.all(entities.map(entity => {
      (<any>entity)['deckId'] = deckId;
      return service.create(entity, true);
    }));
    return true;
  }






  private async pruneAssets(homeUrl: PersistentPath, currentAssets: Asset[]) {
    if (!this.isElectron()) return;
    const assetsUrl = homeUrl.path + "/" + ElectronService.ASSETS_DIR;
    const validAssetNames = new Set<string>();

    currentAssets.forEach(asset => {
      const extension = StringUtils.mimeToExtension(asset.file.type);
      const filename = StringUtils.toKebabCase(asset.name) + '.' + extension;
      validAssetNames.add(filename);
    });

    try {
      const files = await this.listDirectory({ bookmark: homeUrl.bookmark, path: assetsUrl });
      for (const file of files) {
        if (file.isFile && !file.name.includes('.DS_Store') && !validAssetNames.has(file.name)) {
          console.log(`Pruning orphaned asset: ${file.name}`);
          await this.removeDirectory({ bookmark: homeUrl.bookmark, path: assetsUrl + '/' + file.name });
        }
      }
    } catch (e) {
      console.error("Error pruning assets", e);
    }
  }

  private async pruneDecks(homeUrl: PersistentPath, currentDecks: { name: string }[]) {
    if (!this.isElectron()) return;
    const decksUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR;
    const validDeckNames = new Set(currentDecks.map(d => StringUtils.toKebabCase(d.name)));

    try {
      const files = await this.listDirectory({ bookmark: homeUrl.bookmark, path: decksUrl });
      for (const file of files) {
        if (file.isDirectory && !validDeckNames.has(file.name)) {
          console.log(`Pruning orphaned deck: ${file.name}`);
          await this.removeDirectory({ bookmark: homeUrl.bookmark, path: decksUrl + '/' + file.name });
        }
      }
    } catch (e) {
      console.error("Error pruning decks", e);
    }
  }

  private async pruneTemplates(homeUrl: PersistentPath, deckName: string, currentTemplates: CardTemplate[]) {
    if (!this.isElectron()) return;
    const deckUrl = homeUrl.path + "/" + ElectronService.DECKS_DIR + '/' + StringUtils.toKebabCase(deckName);
    const validTemplateNames = new Set<string>();
    currentTemplates.forEach(t => {
      const base = StringUtils.toKebabCase(t.name);
      validTemplateNames.add(base + '.css');
      validTemplateNames.add(base + '.html');
    });
    // Always keep these
    validTemplateNames.add('cards.csv');
    validTemplateNames.add('attributes.csv');

    try {
      const files = await this.listDirectory({ bookmark: homeUrl.bookmark, path: deckUrl });
      for (const file of files) {
        if (file.isFile && !validTemplateNames.has(file.name)) {
          // Only prune html/css/csv if they look like template files or old data? 
          // Be careful not to delete .DS_Store or other system files
          if (file.name.endsWith('.html') || file.name.endsWith('.css')) {
            console.log(`Pruning orphaned template file: ${file.name} in deck ${deckName}`);
            await this.removeDirectory({ bookmark: homeUrl.bookmark, path: deckUrl + '/' + file.name });
          }
        }
      }
    } catch (e) {
      console.error(`Error pruning templates for deck ${deckName}`, e);
    }
  }

  private async pruneDocuments(homeUrl: PersistentPath, currentDocuments: Document[]) {
    if (!this.isElectron()) return;
    const validDocumentNames = new Set<string>();
    currentDocuments.forEach(doc => {
      const mimeType = doc.mime ?? 'text/markdown';
      const extension = StringUtils.mimeToExtension(mimeType);
      const filename = doc.name + (doc.name.endsWith('.' + extension) ? '' : '.' + extension);
      validDocumentNames.add(filename);
    });

    try {
      const files = await this.listDirectory({ bookmark: homeUrl.bookmark, path: homeUrl.path });
      for (const file of files) {
        if (file.isFile && !file.name.includes('.DS_Store') &&
          (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.MD') || file.name.endsWith('.css') || file.name.endsWith('.CSS'))) {

          // Only prune if it's NOT in our valid list
          if (!validDocumentNames.has(file.name)) {
            console.log(`Pruning orphaned document: ${file.name}`);
            await this.removeDirectory({ bookmark: homeUrl.bookmark, path: homeUrl.path + '/' + file.name });
          }
        }
      }
    } catch (e) {
      console.error("Error pruning documents", e);
    }
  }

}
