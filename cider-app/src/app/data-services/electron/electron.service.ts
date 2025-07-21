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

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private static readonly ASSETS_DIR = "assets";
  private static readonly DECKS_DIR = "decks";
  private projectOpen: BehaviorSubject<boolean>;
  private projectHomeUrl: BehaviorSubject<string | undefined>;
  private projectUnsaved: BehaviorSubject<boolean>;
  private appClosed: Subject<null>;

  constructor() {
    this.projectOpen = new BehaviorSubject<boolean>(false);
    this.projectHomeUrl = new BehaviorSubject<string | undefined>(undefined);
    this.projectUnsaved = new BehaviorSubject<boolean>(false);
    this.appClosed = new Subject<null>();

    if (this.isElectron()) {
      this.getIpcRenderer().on('app-closed', () => {
        this.appClosed.next(null);
      });
    }
  }

  public getProjectOpen() {
    return this.projectOpen.asObservable();
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
  }

  /**
   * Determine if application is running in electron
   * 
   * @returns true/false
   */
  public isElectron() : boolean {
    return typeof window !== 'undefined' 
      && typeof window.process === 'object' 
      && (<any>window.process).type === 'renderer';
  }

  private getIpcRenderer(): IpcRenderer {
    return window.require('electron').ipcRenderer;
  }

  public selectDirectory(url: string | undefined) {
    this.projectHomeUrl.next(url);
  }

  public async openSelectDirectoryDialog(): Promise<string | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    const result_2 = await this.getIpcRenderer().invoke("open-select-directory-dialog");
    if (!result_2.canceled) {
      this.projectHomeUrl.next(result_2.filePaths[0]);
      console.log("projectHomeUrl: ", result_2.filePaths[0]);
      return result_2.filePaths[0];
    }
    return null;
  }

  public createDirectory(dirUrl: string): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("create-directory", dirUrl);
  }

  public removeDirectory(dirUrl: string): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("remove-directory", dirUrl);
  }

  public listDirectory(dirUrl: string): Promise<{ 
    name: string; isDirectory: boolean; isFile: boolean; }[]> {
    if (!this.isElectron()) {
      return Promise.resolve([]);
    }
    return this.getIpcRenderer().invoke("list-directory", dirUrl);
  }

  public readFile(fileUrl: string): Promise<Buffer | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("read-file", fileUrl);
  }

  public readTextFile(fileUrl: string): Promise<string | null> {
    if (!this.isElectron()) {
      return Promise.resolve(null);
    }
    return this.getIpcRenderer().invoke("read-text-file", fileUrl);
  }

  public writeFile(fileUrl: string, data: string | NodeJS.ArrayBufferView): Promise<boolean> {
    if (!this.isElectron()) {
      return Promise.resolve(false);
    }
    return this.getIpcRenderer().invoke("write-file", fileUrl, data);
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

  public async saveProject(assets: Asset[], decks: { name: string; cardsCsv: string; 
    attributesCsv: string; templates: CardTemplate[];}[]) {
    if (!this.isElectron()) {
      return;
    }
    const homeUrl = this.projectHomeUrl.getValue();
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const decksUrl = homeUrl + "/" + ElectronService.DECKS_DIR;

    await this.removeDirectory(assetsUrl);
    await this.createDirectory(assetsUrl);
    const writeAllAssets: Promise<boolean[]> = Promise.all(assets.map(async asset => {
      const buffer = await asset.file.arrayBuffer();
      return await this.writeFile(
        assetsUrl + '/' + StringUtils.toKebabCase(asset.name)
        + '.' + StringUtils.mimeToExtension(asset.file.type),
        Buffer.from(buffer));
    }));

    await this.removeDirectory(decksUrl);
    await this.createDirectory(decksUrl);
    const writeAllDecks = await Promise.all(decks.map(async deck => {
      const deckUrl = decksUrl + '/' + StringUtils.toKebabCase(deck.name);
      await this.createDirectory(deckUrl);
      this.writeFile(deckUrl + '/cards.csv', deck.cardsCsv);
      this.writeFile(deckUrl + '/attributes.csv', deck.attributesCsv)
      const writeTemplates = await Promise.all(deck.templates.map(template => {
        return Promise.all([
          this.writeFile(deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.css', template.css),
          this.writeFile(deckUrl + '/' + StringUtils.toKebabCase(template.name) + '.html', template.html)
        ]);
      }));
      this.setProjectUnsaved(false);
      return true;
    }));
  }

  public async openProject(homeUrl: string, assetsService: AssetsService, decksService: DecksService,
    cardTemplatesService: CardTemplatesService, cardAttributesService: CardAttributesService,
    cardsService: CardsService, documentsService: DocumentsService) {
    if (!this.isElectron()) {
      return;
    }
    const documentsUrl = homeUrl + "/";
    const assetsUrl = homeUrl + "/" + ElectronService.ASSETS_DIR;
    const decksUrl = homeUrl + "/" + ElectronService.DECKS_DIR;
    // read assets
    // read decks
    //   read attributes
    //   read cards
    //   read templates
    await documentsService.emptyTable();
    await assetsService.emptyTable();
    await cardTemplatesService.emptyTable();
    await cardAttributesService.emptyTable();
    await cardsService.emptyTable();
    await decksService.emptyTable();

    // read document/markdown files
    await this.listDirectory(documentsUrl).then(documentUrls => Promise.all(documentUrls
      .filter(documentUrl => documentUrl.isFile 
        && !documentUrl.name.includes('.DS_Store')
        && (documentUrl.name.includes('.md') || documentUrl.name.includes('.markdown') 
        || documentUrl.name.includes('.MD'))
      ).map(async documentUrl => {
      const documentNameSplit = StringUtils.splitNameAndExtension(documentUrl.name);
      const documentName = documentNameSplit.name;
      const documentExt = documentNameSplit.extension;
      const documentBuffer = await this.readFile(documentsUrl + '/' + documentUrl.name);
      if (!documentBuffer) {
        return;
      }
      const fileType = StringUtils.extensionToMime(documentExt);
      const blob: Blob = new Blob([documentBuffer], {type: fileType});
      const content: string = await blob.text();
      const document = await documentsService.create(<any>{
        name: documentName,
        content: content,
      }, true);
      return document;
    })));

    // read assets
    await this.listDirectory(assetsUrl).then(assetUrls => Promise.all(assetUrls
      .filter(assetUrl => assetUrl.isFile && !assetUrl.name.includes('.DS_Store')).map(async assetUrl => {
      const assetNameSplit = StringUtils.splitNameAndExtension(assetUrl.name);
      const assetName = assetNameSplit.name;
      const assetExt = assetNameSplit.extension;
      const assetBuffer = await this.readFile(assetsUrl + '/' + assetUrl.name);
      if (!assetBuffer) {
        return;
      }
      const fileType = StringUtils.extensionToMime(assetExt);
      const blob: Blob = new Blob([assetBuffer], {type: fileType});
      const file: File = new File([blob], assetName, {type: fileType});
      const asset = await assetsService.create(<any>{
        file: file,
        name: assetName
      }, true);
      return asset;
    })));
    const deckUrls = await this.listDirectory(decksUrl);
    deckUrls.filter(deckUrl => deckUrl.isDirectory).map(async deckUrl => {
      const deckName = deckUrl.name;
      const deck = await decksService.create(<any>{name: StringUtils.kebabToTitleCase(deckName)});
      const deckFullUrl = decksUrl + '/' + deckUrl.name;
      // for each .html file, also read the accompanying .css file
      const deckFileUrls = await this.listDirectory(deckFullUrl);
      await Promise.all(deckFileUrls.filter(deckFileUrl => deckFileUrl.isFile 
        && StringUtils.splitNameAndExtension(deckFileUrl.name).extension === 'html').map(async templateUrl => {
          const nameSplit = StringUtils.splitNameAndExtension(templateUrl.name);
          const prettyName = StringUtils.kebabToTitleCase(nameSplit.name);
          const htmlUrl = deckFullUrl + '/' + nameSplit.name + '.html';
          const cssUrl = deckFullUrl + '/' + nameSplit.name + '.css';
          const html = await this.readTextFile(htmlUrl).then(text => text ? text: '');
          const css = await this.readTextFile(cssUrl).then(text => text ? text : '');
          return await cardTemplatesService.create(<any>{ deckId: deck.id, name: prettyName, html: html, css: css }, true);
      }));
      const attributesUrl = deckFullUrl + '/attributes.csv';
      const cardsUrl = deckFullUrl + '/cards.csv';
      const attributes = await this.importCsv(attributesUrl, 'attributes.csv', cardAttributesService, deck.id);
      const cards = await this.importCsv(cardsUrl, 'cards.csv', cardsService, deck.id);
      this.setProjectUnsaved(false);
    });
  }

  private async importCsv<Entity, Identity extends string | number>(fileUrl: string, fileName: string, 
    service: EntityService<Entity, Identity>, deckId: number) {
    const nameSplit = StringUtils.splitNameAndExtension(fileName);
    const fileType = StringUtils.extensionToMime(nameSplit.extension);
    const buffer = await this.readFile(fileUrl);
    if (!buffer) {
      console.log('import csv failed', fileUrl);
      return;
    }
    const blob: Blob = new Blob([buffer], {type: fileType});
    const file: File = new File([blob], fileName, {type: fileType});
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
}
