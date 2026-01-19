import { Component, NgZone, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';
import { ExportProgress } from 'dexie-export-import/dist/export';
import { ImportProgress } from 'dexie-export-import/dist/import';
import { Observable, combineLatest, filter, firstValueFrom, lastValueFrom, timeout } from 'rxjs';
import { ElectronService } from '../data-services/electron/electron.service';
import { AppDB } from '../data-services/indexed-db/db';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { AssetsService } from '../data-services/services/assets.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { DecksService } from '../data-services/services/decks.service';
import { Deck } from '../data-services/types/deck.type';
import StringUtils from '../shared/utils/string-utils';
import XlsxUtils from '../shared/utils/xlsx-utils';
import { DocumentsService } from '../data-services/services/documents.service';
import { PersistentPath } from '../data-services/types/persistent-path.type';
import { TranslateService } from '@ngx-translate/core';
import { ProjectStateService } from '../data-services/services/project-state.service';

@Component({
  selector: 'app-site-menu',
  templateUrl: './site-menu.component.html',
  styleUrls: ['./site-menu.component.scss'],
  providers: [MessageService, ConfirmationService],
  standalone: false
})
export class SiteMenuComponent implements OnInit {

  selectedDeck$: Observable<Deck | undefined>;
  recentProjectUrls$: Observable<PersistentPath[]>;
  projectHomeUrl$: Observable<PersistentPath | undefined>;
  projectUnsaved$: Observable<boolean>;
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
  public currentRoute: string = '';
  public breadcrumbs: MenuItem[] = [];
  public home: MenuItem | undefined;

  constructor(private decksService: DecksService,
    private confirmationService: ConfirmationService,
    private electronService: ElectronService,
    private localStorageService: LocalStorageService,
    private assetsService: AssetsService,
    private cardsService: CardsService,
    private cardAttributesService: CardAttributesService,
    private cardTemplatesService: CardTemplatesService,
    private documentsService: DocumentsService,
    private projectStateService: ProjectStateService,
    private translate: TranslateService,
    private ngZone: NgZone,
    private router: Router,
    private db: AppDB) {
    // allow reloading of the current page
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
    // set unsaved whenever db changes are detected on a project with a url
    this.db.onChange().subscribe(() => {
      const isProjectOpen = this.electronService.getIsProjectOpen().getValue();
      if (isProjectOpen) {
        this.electronService.setProjectUnsaved(true);
      }
    });
    this.electronService.getIsAppClosed().subscribe(() => {
      this.ngZone.run(() => {
        this.exitCider();
      });
    });
    this.items = [];
    this.selectedDeck$ = this.decksService.getSelectedDeck();
    this.recentProjectUrls$ = this.localStorageService.getRecentProjectUrls();
    this.projectHomeUrl$ = this.electronService.getProjectHomeUrl();
    this.projectUnsaved$ = this.electronService.getProjectUnsaved();
    this.recentProjectUrlItems = [];
  }

  ngOnInit(): void {
    combineLatest([this.selectedDeck$, this.recentProjectUrls$,
    this.projectHomeUrl$, this.projectUnsaved$,
    this.translate.onLangChange]).subscribe({
      next: ([selectedDeck, persistentPaths, projectHomeUrl,
        projectUnsaved, langChange]) => {
        // setup the recent project urls
        this.recentProjectUrlItems = persistentPaths.map(persistentPath => {
          return {
            label: StringUtils.lastDirectoryFromUrl(persistentPath.path),
            title: persistentPath.path,
            icon: 'pi pi-pw pi-folder',
            command: () => {
              this.electronService.selectDirectory(persistentPath);
              this.localStorageService.addRecentProjectUrl(persistentPath);
              this.openProject(persistentPath);
              this.electronService.setProjectUnsaved(false);
            }
          }
        });

        // setup the menu items
        this.items = [
          {
            label: this.translate.instant('menu.file'),
            icon: 'pi pi-pw pi-file',
            items: [
              {
                label: this.translate.instant('menu.new'),
                icon: 'pi pi-pw pi-file',
                visible: this.electronService.isElectron(),
                command: () => this.newProject()
              },
              {
                label: this.translate.instant('menu.open-project'),
                icon: 'pi pi-pw pi-folder',
                visible: this.electronService.isElectron(),
                command: () => this.openSelectDirectoryDialog()
              }, {
                label: this.translate.instant('menu.open-recent'),
                icon: 'pi pi-pw pi-folder',
                visible: this.electronService.isElectron(),
                disabled: !this.recentProjectUrlItems
                  || this.recentProjectUrlItems.length <= 0,
                items: this.recentProjectUrlItems
              }, {
                label: this.translate.instant('menu.save'),
                icon: 'pi pi-pw pi-save',
                visible: this.electronService.isElectron(),
                disabled: !projectHomeUrl && !projectUnsaved,
                command: () => this.saveProject()
              }, {
                label: this.translate.instant('menu.save-as'),
                icon: 'pi pi-pw pi-save',
                disabled: !projectHomeUrl && !projectUnsaved,
                visible: this.electronService.isElectron(),
                command: () => this.saveProjectAs()
              }, {
                separator: true,
                visible: this.electronService.isElectron(),
              }, {
                label: this.translate.instant('menu.advanced'),
                icon: 'pi pi-pw pi-database',
                items: [
                  {
                    label: this.translate.instant('menu.reload-project'),
                    icon: 'pi pi-pw pi-folder',
                    visible: this.electronService.isElectron(),
                    command: () => this.reloadProjectProcedure()
                  }, {
                    label: this.translate.instant('menu.reset-database'),
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openResetDialog()
                  }, {
                    label: this.translate.instant('menu.import-database'),
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openImportDialog()
                  }, {
                    label: this.translate.instant('menu.export-database'),
                    icon: 'pi pi-pw pi-database',
                    command: () => this.openExportDialog()
                  }
                ]
              }, {
                separator: true
              }, {
                label: this.translate.instant("menu.export-cards"),
                icon: 'pi pi-pw pi-file-pdf',
                disabled: !selectedDeck,
                routerLink: [`/decks/${selectedDeck?.id}/export-cards`]
              }, {
                separator: true,
                visible: this.electronService.isElectron(),
              }, {
                label: this.translate.instant('menu.exit-project'),
                icon: 'pi pi-pw pi-file',
                disabled: !projectHomeUrl && !projectUnsaved,
                visible: this.electronService.isElectron(),
                command: () => this.openExitProjectDialog()
              }, {
                label: this.translate.instant('menu.exit-cider'),
                icon: 'pi pi-pw pi-file',
                visible: this.electronService.isElectron(),
                command: () => this.exitCider()
              }
            ]
          }
        ];
      }
    });

    // use the router to update the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.ngZone.run(async () => {
        const routeUrl = event.urlAfterRedirects;
        this.currentRoute = routeUrl;
        await this.updateBreadcrumbs(routeUrl);
      }
      );
    });

  }

  private async updateBreadcrumbs(routeUrl: string) {
    this.home = { icon: 'pi pi-home', routerLink: '/project' };
    const breadcrumbs: MenuItem[] = [];
    const urlSegments = routeUrl.split('/').filter((segment) => segment);
    let currentPath = '';

    for (let i = 0; i < urlSegments.length; i++) {
      const segment = urlSegments[i];
      let pathSegment = `/${segment}`;
      currentPath += pathSegment;
      const label = await lastValueFrom(
        this.translate.get(`breadcrumbs.${segment}`).pipe(timeout(1000)))
        .then(translation => translation !== `breadcrumbs.${segment}` ? translation
          : StringUtils.kebabToTitleCase(segment));

      breadcrumbs.push({
        label: label,
        routerLink: currentPath,
        disabled: i == urlSegments.length - 1
      });
    }

    this.breadcrumbs = breadcrumbs;
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
      this.db.importDatabase(this.importFile, (progress: ImportProgress) => {
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
        this.db.exportDatabase((progress: ExportProgress) => {
          this.loadingPercent = (progress.completedRows / (progress.totalRows || 100)) * 100;
          return true;
        }).then(() => {
          this.loadingPercent = 100;
          this.displayLoading = false;
        });
      }
    });
  }

  public async openResetDialog() {
    let projectUnsaved = await firstValueFrom(this.projectUnsaved$);
    if (!projectUnsaved) {
      this.db.resetDatabase();
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to reset the entire database?'
        + ' This will delete all unsaved data.',
      header: 'Reset Database',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.db.resetDatabase()
    });
  }

  public async openExitProjectDialog() {
    let projectUnsaved = await firstValueFrom(this.projectUnsaved$);
    if (!projectUnsaved) {
      this.exitProjectProcedure();
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to exit the project?'
        + ' This will delete all unsaved data.',
      header: 'Exit Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.exitProjectProcedure()
    });
  }

  private exitProjectProcedure() {
    this.db.resetDatabase(true).then(() => {
      this.assetsService.updateAssetUrls();
      this.electronService.selectDirectory(undefined);
      this.electronService.setProjectUnsaved(false);
      this.electronService.setProjectOpen(false);
      this.decksService.selectDeck(undefined);
      this.router.navigateByUrl(`/`);
    });
  }

  public logoClicked() {
    this.isSaving = true;
    setTimeout(() => {
      this.isSaving = false;
    }, 1800);
  }

  public openSelectDirectoryDialog() {
    this.electronService.openSelectDirectoryDialog().then(url => {
      if (url) {
        this.localStorageService.addRecentProjectUrl(url);
      }
      return url;
    }).then((url: PersistentPath | null) => {
      if (url) {
        this.openProject(url);
      }
    })
  }

  public async newProject() {
    let projectUnsaved = await firstValueFrom(this.projectUnsaved$);
    if (!projectUnsaved) {
      this.newProjectProcedure();
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to create a new project?'
        + ' This will delete all of your unsaved data.',
      header: 'New Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.newProjectProcedure()
    });
  }

  private newProjectProcedure() {
    this.db.resetDatabase().then(() => {
      this.electronService.setProjectUnsaved(true);
      this.assetsService.updateAssetUrls();
      this.router.navigateByUrl(`/decks`);
      this.electronService.setProjectOpen(true);
    });
  }

  public saveProjectAs() {
    this.electronService.openSelectDirectoryDialog().then(url => {
      if (url) {
        this.localStorageService.addRecentProjectUrl(url);
      }
      return url;
    }).then((url: PersistentPath | null) => {
      if (url) {
        this.saveProject();
      }
    })
  }

  public async saveProject() {
    const projectHomeUrl = await firstValueFrom(this.electronService.getProjectHomeUrl());
    if (!projectHomeUrl) {
      console.log('No project directory open.');
      this.saveProjectAs();
      return;
    }

    // activate the gif
    this.isSaving = true;
    this.loadingIndeterminate = true;
    this.displayLoading = true;
    this.loadingHeader = 'Saving Project';
    this.loadingInfo = 'Exporting database rows...';

    // save to the filesystem
    const assetsPromised = this.assetsService.getAll();
    const documentsPromised = this.documentsService.getAll();
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
        id: deck.id,
        name: StringUtils.toKebabCase(deck.name),
        cardsCsv: cardsCsv,
        attributesCsv: attributesCsv,
        templates: templates
      };
    })));

    Promise.all([assetsPromised, documentsPromised, decksPromised]).then(async ([assets, documents, decks]) => {
      const dirtyEntities = await firstValueFrom(this.projectStateService.getDirtyEntities());
      return this.electronService.saveProject(assets, documents, decks, dirtyEntities);
    }).then(() => {
      this.electronService.setProjectUnsaved(false);
      this.projectStateService.clearDirtyState();
      this.isSaving = false;
      this.displayLoading = false;
    });
  }

  public async openProject(persistentPath: PersistentPath) {
    let projectUnsaved = await firstValueFrom(this.projectUnsaved$);
    if (!projectUnsaved) {
      this.openProjectProcedure(persistentPath);
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to open another project?'
        + ' All unsaved data will be lost.',
      header: 'Open Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.openProjectProcedure(persistentPath)
    });
  }

  private async reloadProjectProcedure() {
    const projectHomeUrl = await firstValueFrom(this.electronService.getProjectHomeUrl());
    if (!projectHomeUrl) {
      console.log('No project directory open.');
      this.saveProjectAs();
      return;
    }
    this.openProjectProcedure(projectHomeUrl);
  }

  private openProjectProcedure(persistentPath: PersistentPath) {
    // Check for crash recovery
    const recoveryPath = this.projectStateService.getCrashRecoveryPath();
    if (recoveryPath === persistentPath.path) {
      this.confirmationService.confirm({
        message: 'It appears the application closed unexpectedly while working on this project. Do you want to recover your unsaved changes?',
        header: 'Crash Recovery',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.executeOpenProject(persistentPath, true);
        },
        reject: () => {
          this.executeOpenProject(persistentPath, false);
        }
      });
    } else {
      this.executeOpenProject(persistentPath, false);
    }
  }

  private executeOpenProject(persistentPath: PersistentPath, recover: boolean) {
    this.loadingIndeterminate = true;
    this.loadingHeader = 'Opening Project';
    this.loadingInfo = 'Reading project data...';
    this.displayLoading = true;
    this.projectStateService.setTrackingEnabled(false);
    this.electronService.openProject(persistentPath, this.db, this.assetsService, this.decksService,
      this.cardTemplatesService, this.cardAttributesService, this.cardsService,
      this.documentsService, recover).then(async () => {
        this.projectStateService.setTrackingEnabled(true);
        this.assetsService.updateAssetUrls();
        this.decksService.selectDeck(undefined);
        if (recover) {
          await this.projectStateService.markAllDirty();
        } else {
          this.projectStateService.clearDirtyState();
        }
        this.electronService.setProjectOpen(true);
        this.router.navigateByUrl(`/project`);
        this.displayLoading = false;
      });
  }

  public titlebarDoubleClick() {
    this.electronService.titlebarDoubleClick();
  }

  public async exitCider() {
    let projectUnsaved = await firstValueFrom(this.projectUnsaved$);
    if (!projectUnsaved) {
      this.electronService.exitApplication();
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to exit the application?'
        + ' All unsaved data will be lost.',
      header: 'Exit Application',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.electronService.exitApplication()
    });
  }

}
