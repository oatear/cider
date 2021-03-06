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
            label: selectedGame ? selectedGame.name : 'Games',
            icon: 'pi pi-pw pi-play',
            routerLink: ['/games']
          }, {
            label: 'Cards',
            icon: 'pi pi-pw pi-tablet',
            routerLink: [`/games/${selectedGame?.id}/cards/listing`]
          }, {
            label: 'Templates',
            icon: 'pi pi-pw pi-id-card',
            routerLink: [`/games/${selectedGame?.id}/card-templates`]
          }, {
            label: 'Assets',
            icon: 'pi pi-pw pi-folder',
            routerLink: [`/games/${selectedGame?.id}/assets`]
          }, {
            label: 'Import/Export',
            icon: 'pi pi-pw pi-file',
            items: [
              {
                label: 'Reset Database',
                icon: 'pi pi-pw pi-file',
                command: () => this.openResetDialog()
              },
              {
                label: 'Import Database',
                icon: 'pi pi-pw pi-file',
                command: () => this.openImportDialog()
              }, {
                label: 'Export Database',
                icon: 'pi pi-pw pi-file',
                command: () => this.openExportDialog()
              }, {
                label: 'Export Cards',
                icon: 'pi pi-pw pi-file',
                routerLink: [`/games/${selectedGame?.id}/export-cards`]
              }
            ]
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

}
