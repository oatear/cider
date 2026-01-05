import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { firstValueFrom, Observable, take } from 'rxjs';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { AssetsService } from '../data-services/services/assets.service';
import { ElectronService } from '../data-services/electron/electron.service';
import { DecksService } from '../data-services/services/decks.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardsService } from '../data-services/services/cards.service';
import { Router } from '@angular/router';
import StringUtils from '../shared/utils/string-utils';
import { AppDB } from '../data-services/indexed-db/db';
import { DocumentsService } from '../data-services/services/documents.service';
import { PersistentPath } from '../data-services/types/persistent-path.type';

@Component({
    selector: 'app-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    providers: [ConfirmationService],
    standalone: false
})
export class WelcomeComponent implements OnInit {
  public displayLoading: boolean = false;
  public loadingIndeterminate: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';
  public loadingHeader: string = '';
  isElectron: boolean;
  projectHomeUrl$: Observable<PersistentPath | undefined>;
  projectUnsaved$: Observable<boolean>;

  recentProjectUrls: { persistentPath: PersistentPath; name: string; hue: number; hue2: number; hover: boolean}[] = [];

  constructor(private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private assetsService: AssetsService,
    private electronService: ElectronService,
    private decksService: DecksService,
    private cardTemplatesService: CardTemplatesService,
    private cardAttributesService: CardAttributesService,
    private cardsService: CardsService,
    private documentsService: DocumentsService,
    private router: Router,
    private db: AppDB) {
      this.isElectron = electronService.isElectron();
      this.projectHomeUrl$ = electronService.getProjectHomeUrl();
      this.projectUnsaved$ = electronService.getProjectUnsaved();
  }

  ngOnInit(): void {
    this.localStorageService.getRecentProjectUrls().subscribe(urls => {
      this.recentProjectUrls = urls.map(url => this.urlToProjectInfo(url));
    });
    // uncomment to test recent projects
    // this.isElectron = true;
    // const urls = [
    //   'usr/samurai-saga',
    //   'usr/tribulating-troubles',
    //   'usr/mystical-mountain-adventure',
    //   'usr/epic-quest-of-heroes',
    //   'usr/ancient-ruins-exploration',
    // ];
    // this.recentProjectUrls = urls.map(url => this.urlToProjectInfo(url));
  }

  private urlToProjectInfo(persistentPath: PersistentPath) {
      let name = StringUtils.lastDirectoryFromUrl(persistentPath.path);
      let hue = this.calculateHue(name);
      let hue2diff = 120;
      return {
        persistentPath: persistentPath,
        name: name,
        hue: hue,
        hue2: (hue + hue2diff) % 360,
        hover: false
      }
  }

  public async newProject(keepEmpty: boolean) {
    let [projectHomeUrl, projectUnsaved] = await Promise.all([firstValueFrom(this.projectHomeUrl$), 
      firstValueFrom(this.projectUnsaved$)]);
    if (!projectHomeUrl && !projectUnsaved) {
      this.newProjectProcedure(keepEmpty);
      return;
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to create a new project?'
        + ' This will delete all of your unsaved data.',
      header: 'New Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.newProjectProcedure(keepEmpty)
    });
  }

  newProjectProcedure(keepEmpty: boolean) {
    this.db.resetDatabase(keepEmpty).then(() => {
      this.assetsService.updateAssetUrls();
      this.electronService.setProjectUnsaved(true);
      this.electronService.setProjectOpen(true);
      this.router.navigateByUrl(`/project`);
    });
  }

  public async openProject(url: PersistentPath) {
    let [projectHomeUrl, projectUnsaved] = await Promise.all([firstValueFrom(this.projectHomeUrl$), 
      firstValueFrom(this.projectUnsaved$)]);
    if (!projectHomeUrl && !projectUnsaved) {
      this.openProjectProcedure(url);
    }
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to open another project?'
        + ' All unsaved data will be lost.',
      header: 'Open Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.openProjectProcedure(url)
    });
  }

  openProjectProcedure(url: PersistentPath) {
    this.electronService.selectDirectory(url);
    this.localStorageService.addRecentProjectUrl(url);
    this.electronService.setProjectUnsaved(false);
    this.loadingIndeterminate = true;
    this.loadingHeader = 'Opening Project';
    this.loadingInfo = 'Reading project data...';
    this.displayLoading = true;
    this.electronService.openProject(url, this.db, this.assetsService, this.decksService,
      this.cardTemplatesService, this.cardAttributesService, this.cardsService, 
      this.documentsService).then(() => {
      this.assetsService.updateAssetUrls();
      this.electronService.setProjectUnsaved(false);
      this.electronService.setProjectOpen(true);
      this.decksService.selectDeck(undefined);
      this.router.navigateByUrl(`/project`);
      this.displayLoading = false;
    });
  }

  calculateHue(text: string) {
    if (!text) {
      return 255;
    }
    const cleanText = text.toLowerCase().replace(/[^a-z]*/g, '');
    let sum = 0;
    for (var i=0; i < cleanText.length; i++) {
      sum += (cleanText.charCodeAt(i) - 97) * 255 / 25;
    }
    //return (sum / cleanText.length) & 0xFF;
    return sum & 0xFF;
  }

}
