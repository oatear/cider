import { Component, Input, OnInit } from '@angular/core';
import { ExportProgress } from 'dexie-export-import/dist/export';
import { ImportProgress } from 'dexie-export-import/dist/import';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Observable, combineLatest } from 'rxjs';
import { ElectronService } from '../data-services/electron/electron.service';
import { db } from '../data-services/indexed-db/db';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { DecksService } from '../data-services/services/decks.service';
import { Deck } from '../data-services/types/deck.type';

@Component({
  selector: 'app-site-content-and-menu',
  templateUrl: './site-content-and-menu.component.html',
  styleUrls: ['./site-content-and-menu.component.scss'],
  providers: [ConfirmationService]
})
export class SiteContentAndMenuComponent implements OnInit {

  selectedDeck$: Observable<Deck | undefined>;
  recentProjectUrls$: Observable<string[]>;
  recentProjectUrlItems: MenuItem[];
  isSaving: boolean = false;
  items: MenuItem[];
  importVisible: boolean = false;
  importFile: File | undefined = undefined;
  public displayLoading: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';

  constructor(private decksService : DecksService,
    private confirmationService: ConfirmationService,
    private electronService: ElectronService,
    private localStorageService: LocalStorageService) { 
    this.items = [];
    this.selectedDeck$ = this.decksService.getSelectedDeck();
    this.recentProjectUrls$ = this.localStorageService.getRecentProjectUrls();
    this.recentProjectUrlItems = [];
  }

  ngOnInit(): void {

    combineLatest([this.selectedDeck$, this.recentProjectUrls$]).subscribe({
      next: ([selectedDeck, urls]) => {
        // setup the recent project urls
        this.recentProjectUrlItems = urls.map(url => {return {
          label: url.substring(url.lastIndexOf('/') | 0),
          title: url,
          icon: 'pi pi-pw pi-folder',
          command: () => {
            this.electronService.selectDirectory(url);
            this.localStorageService.addRecentProjectUrl(url);
          }
        }});

        // setup the menu items
        this.items = [
          {
            label: 'File',
            icon: 'pi pi-pw pi-file',
            items: [
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
                visible: this.electronService.isElectron()
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
      this.displayLoading = true;
      this.loadingPercent = 0;
      this.loadingInfo = 'Importing database rows...';
      db.importDatabase(this.importFile, (progress: ImportProgress) => {
        this.loadingPercent = (progress.completedRows / (progress.totalRows || 100)) * 100;
        return true;
      }).then(() => {
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
        this.displayLoading = true;
        this.loadingPercent = 0;
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
    });
  }

  public titlebarDoubleClick() {
    this.electronService.titlebarDoubleClick();
  }

  public exitCider() {
    this.electronService.exitApplication();
  }

}
