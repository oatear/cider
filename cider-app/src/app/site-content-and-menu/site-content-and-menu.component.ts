import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExportProgress } from 'dexie-export-import/dist/export';
import { ImportProgress } from 'dexie-export-import/dist/import';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Observable, combineLatest, lastValueFrom, firstValueFrom } from 'rxjs';
import { ElectronService } from '../data-services/electron/electron.service';
import { db } from '../data-services/indexed-db/db';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { DecksService } from '../data-services/services/decks.service';
import { Deck } from '../data-services/types/deck.type';
import StringUtils from '../shared/utils/string-utils';
import XlsxUtils from '../shared/utils/xlsx-utils';

@Component({
  selector: 'app-site-content-and-menu',
  templateUrl: './site-content-and-menu.component.html',
  styleUrls: ['./site-content-and-menu.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SiteContentAndMenuComponent implements OnInit {

  selectedDeck$: Observable<Deck | undefined>;
  recentProjectUrls$: Observable<string[]>;
  projectHomeUrl$: Observable<string | undefined>;
  recentProjectUrlItems: MenuItem[];
  isSaving: boolean = false;
  items: MenuItem[];
  importVisible: boolean = false;
  importFile: File | undefined = undefined;
  public displayLoading: boolean = false;
  public loadingIndeterminate: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';
  public loadingHeader: string = '';

  constructor(private decksService : DecksService,
    private confirmationService: ConfirmationService,
    private electronService: ElectronService,
    private localStorageService: LocalStorageService,
    private assetsService: AssetsService,
    private cardsService: CardsService,
    private cardAttributesService: CardAttributesService,
    private cardTemplatesService: CardTemplatesService,
    private messageService: MessageService, 
    private router: Router) {
    // allow reloading of the current page
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    this.items = [];
    this.selectedDeck$ = this.decksService.getSelectedDeck();
    this.recentProjectUrls$ = this.localStorageService.getRecentProjectUrls();
    this.projectHomeUrl$ = this.electronService.getProjectHomeUrl();
    this.recentProjectUrlItems = [];
  }

  ngOnInit(): void {

    combineLatest([this.selectedDeck$, this.recentProjectUrls$, this.projectHomeUrl$]).subscribe({
      next: ([selectedDeck, urls, projectHomeUrl]) => {
        // setup the recent project urls
        this.recentProjectUrlItems = urls.map(url => {return {
          label: url.substring(url.lastIndexOf('/') | 0),
          title: url,
          icon: 'pi pi-pw pi-folder',
          command: () => {
            this.electronService.selectDirectory(url);
            this.localStorageService.addRecentProjectUrl(url);
            this.openProject(url);
          }
        }});

        // setup the menu items
        this.items = [
          {
            label: 'File',
            icon: 'pi pi-pw pi-file',
            items: [
              {
                label: 'New',
                icon: 'pi pi-pw pi-file',
                visible: this.electronService.isElectron(),
                command: () => this.newProject()
              }, 
              {
                label: 'Open Project',
                icon: 'pi pi-pw pi-folder',
                visible: this.electronService.isElectron(),
                command: () => this.openSelectDirectoryDialog()
              }, {
                label: 'Open Recent',
                icon: 'pi pi-pw pi-folder',
                visible: this.electronService.isElectron(),
                disabled: !this.recentProjectUrlItems 
                  || this.recentProjectUrlItems.length <= 0,
                items: this.recentProjectUrlItems
              }, {
                label: 'Save',
                icon: 'pi pi-pw pi-save',
                visible: this.electronService.isElectron(),
                disabled: typeof projectHomeUrl !== 'string',
                command: () => this.saveProject()
              }, {
                label: 'Save As',
                icon: 'pi pi-pw pi-save',
                visible: this.electronService.isElectron(),
                command: () => this.saveProjectAs()
              }, {
                  separator:true
              }, {
                label: 'Advanced',
                icon: 'pi pi-pw pi-database',
                items: [
                  {
                    label: 'Reset Database',
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openResetDialog()
                  }, {
                    label: 'Import Database',
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openImportDialog()
                  }, {
                    label: 'Export Database',
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openExportDialog()
                  }
                ]
              }, {
                separator:true
              }, {
                label: 'Export Cards',
                icon: 'pi pi-pw pi-file-pdf',
                disabled: !selectedDeck,
                routerLink: [`/decks/${selectedDeck?.id}/export-cards`]
              }, {
                separator:true
              }, {
                label: 'Exit Project',
                icon: 'pi pi-pw pi-file',
                visible: this.electronService.isElectron(),
                command: () => this.openExitProjectDialog()
              }, {
                label: 'Exit Cider',
                icon: 'pi pi-pw pi-file',
                visible: this.electronService.isElectron(),
                command: () => this.exitCider()
              }
            ]
          }, {
            label: selectedDeck ? selectedDeck.name : 'Select Deck',
            icon: 'pi pi-pw pi-book',
            styleClass: 'selected-deck',
            routerLink: ['/decks']
          }, {
            label: 'Cards',
            icon: 'pi pi-pw pi-table',
            disabled: !selectedDeck,
            routerLink: [`/decks/${selectedDeck?.id}/cards/listing`]
          }, {
            label: 'Templates',
            icon: 'pi pi-pw pi-id-card',
            disabled: !selectedDeck,
            routerLink: [`/decks/${selectedDeck?.id}/card-templates`]
          }, {
            label: 'Assets',
            icon: 'pi pi-pw pi-image',
            routerLink: [`/assets`]
          }
        ];
    }});
  }
  
  public uploadFile(event: any) {
    if (event?.currentFiles?.length) {
      this.importFile = event.files[0];
    }
  }

  public confirmDatabaseImport() {
    if (this.importFile) {
      this.loadingIndeterminate = false;
      this.displayLoading = true;
      this.loadingPercent = 0;
      this.loadingHeader = 'Importing Data';
      this.loadingInfo = 'Importing database rows...';
      db.importDatabase(this.importFile, (progress: ImportProgress) => {
        this.loadingPercent = (progress.completedRows / (progress.totalRows || 100)) * 100;
        return true;
      }).then(() => {
        this.assetsService.updateAssetUrls();
      }).then(() => {
        this.decksService.selectDeck(undefined);
        this.router.navigateByUrl(`/decks`);
        this.loadingPercent = 100;
        this.displayLoading = false;
      });
      this.importVisible = false;
    }
  }

  public openImportDialog() {
    this.importVisible = true;
  }

  public closeImportDialog() {
    this.importVisible = false;
  }

  public openExportDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to export the entire database?',
      header: 'Export Database',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingIndeterminate = false;
        this.displayLoading = true;
        this.loadingPercent = 0;
        this.loadingHeader = 'Exporting Data';
        this.loadingInfo = 'Exporting database rows...';
        db.exportDatabase((progress: ExportProgress) => {
          this.loadingPercent = (progress.completedRows / (progress.totalRows || 100)) * 100;
          return true;
        }).then(() => {
          this.loadingPercent = 100;
          this.displayLoading = false;
        });
      }
    });
  }

  public openResetDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to reset the entire database?'
        + ' This will delete all of your data.',
      header: 'Reset Database',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        db.resetDatabase();
      }
    });
  }

  public openExitProjectDialog() {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to exit the project?'
        + ' This will delete all unsaved data.',
      header: 'Exit Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        db.resetDatabase().then(() => {
          this.assetsService.updateAssetUrls();
          this.electronService.selectDirectory(undefined);
          this.decksService.selectDeck(undefined);
          this.router.navigateByUrl(`/decks`);
        });
      }
    });
  }

  public logoClicked() {
    this.isSaving = true;
    setTimeout (() => {
      this.isSaving = false;
    }, 1800);
  }

  public openSelectDirectoryDialog() {
    this.electronService.openSelectDirectoryDialog().then(url => {
      if (url) {
        this.localStorageService.addRecentProjectUrl(url);
      }
      return url;
    }).then((url: string | null) => {
      if (url) {
        this.openProject(url);
      }
    })
  }

  public newProject() {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to create a new project?'
        + ' This will delete all of your unsaved data.',
      header: 'New Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        db.resetDatabase().then(() => {
          this.assetsService.updateAssetUrls();
        });
      }
    });
  }

  public saveProjectAs() {
    this.electronService.openSelectDirectoryDialog().then(url => {
      if (url) {
        this.localStorageService.addRecentProjectUrl(url);
      }
      return url;
    }).then((url: string | null) => {
      if (url) {
        this.saveProject();
      }
    })
  }

  public async saveProject() {
    const projectHomeUrl = await firstValueFrom(this.electronService.getProjectHomeUrl());
    if (!projectHomeUrl) {
      this.messageService.add({severity:'Error', summary: 'Error', detail: 'No project directory open.', life: 3000});
      console.log('No project directory open.');
      return;
    }

    // activate the gif
    this.isSaving = true;
    setTimeout (() => {
      this.isSaving = false;
    }, 900);

    // save to the filesystem
    const assetsPromised = this.assetsService.getAll();
    const decksPromised = this.decksService.getAll().then(decks => Promise.all(decks.map(async deck => {
      // cards
      const [cardFields, cardLookups, cardRecords] = await Promise.all([
        this.cardsService.getFields({ deckId: deck.id }),
        this.cardsService.getLookups({ deckId: deck.id }),
        this.cardsService.getAll({ deckId: deck.id })
      ]);
      const cardsCsv = XlsxUtils.entityExport(cardFields, cardLookups, cardRecords);
      // attributes
      const [attributeFields, attributeLookups, attributeRecords] = await Promise.all([
        this.cardAttributesService.getFields({ deckId: deck.id }),
        this.cardAttributesService.getLookups({ deckId: deck.id }),
        this.cardAttributesService.getAll({ deckId: deck.id })
      ]);
      const attributesCsv = XlsxUtils.entityExport(attributeFields, attributeLookups, attributeRecords);
      // templates
      const templates = await this.cardTemplatesService.getAll({ deckId: deck.id });
      return {
        name: StringUtils.toKebabCase(deck.name),
        cardsCsv: cardsCsv,
        attributesCsv: attributesCsv,
        templates: templates
      };
    })));
    
    Promise.all([assetsPromised, decksPromised]).then(([assets, decks]) => {
      return this.electronService.saveProject(assets, decks);
    });
  }

  public openProject(url: string) {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to open another project?'
        + ' All unsaved data will be lost.',
      header: 'Open Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loadingIndeterminate = true;
        this.loadingHeader = 'Opening Project';
        this.loadingInfo = 'Reading project data...';
        this.displayLoading = true;
        this.electronService.openProject(url, this.assetsService, this.decksService,
          this.cardTemplatesService, this.cardAttributesService, this.cardsService).then(() => {
          this.assetsService.updateAssetUrls();
          this.decksService.selectDeck(undefined);
          this.router.navigateByUrl(`/decks`);
          this.displayLoading = false;
        });
      }
    });
  }

  public titlebarDoubleClick() {
    this.electronService.titlebarDoubleClick();
  }

  public exitCider() {
    this.electronService.exitApplication();
  }

}
