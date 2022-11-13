import { Component, Input, OnInit } from '@angular/core';
import { ExportProgress } from 'dexie-export-import/dist/export';
import { ImportProgress } from 'dexie-export-import/dist/import';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { db } from '../data-services/indexed-db/db';
import { GamesService } from '../data-services/services/games.service';
import { Game } from '../data-services/types/game.type';

@Component({
  selector: 'app-site-content-and-menu',
  templateUrl: './site-content-and-menu.component.html',
  styleUrls: ['./site-content-and-menu.component.scss'],
  providers: [ConfirmationService]
})
export class SiteContentAndMenuComponent implements OnInit {

  selectedGame$: Observable<Game | undefined>;
  items: MenuItem[];
  importVisible: boolean = false;
  importFile: File | undefined = undefined;
  public displayLoading: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';

  constructor(private gamesService : GamesService,
    private confirmationService: ConfirmationService) { 
    this.items = [];
    this.selectedGame$ = this.gamesService.getSelectedGame();
  }

  ngOnInit(): void {
    this.selectedGame$.subscribe({
      next: (selectedGame) => {
        this.items = [
          {
            label: 'File',
            icon: 'pi pi-pw pi-file',
            items: [
              {
                label: 'Open Project',
                icon: 'pi pi-pw pi-file'
              }, {
                label: 'Save',
                icon: 'pi pi-pw pi-save'
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
                routerLink: [`/games/${selectedGame?.id}/export-cards`]
              }
            ]
          }, {
            label: selectedGame ? selectedGame.name : 'Select Game',
            icon: 'pi pi-pw pi-book',
            styleClass: 'selected-game',
            routerLink: ['/games']
          }, {
            label: 'Cards',
            icon: 'pi pi-pw pi-table',
            disabled: !selectedGame,
            routerLink: [`/games/${selectedGame?.id}/cards/listing`]
          }, {
            label: 'Templates',
            icon: 'pi pi-pw pi-id-card',
            disabled: !selectedGame,
            routerLink: [`/games/${selectedGame?.id}/card-templates`]
          }, {
            label: 'Assets',
            icon: 'pi pi-pw pi-image',
            disabled: !selectedGame,
            routerLink: [`/games/${selectedGame?.id}/assets`]
          }
        ]
      }
    });
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

  public titlebarDoubleClick() {
    if (typeof window.require === 'function') {
      const ipcRenderer = window.require('electron').ipcRenderer;
      ipcRenderer.send("window.titlebar-double-clicked");
    }
  }

}
