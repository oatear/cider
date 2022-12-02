import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Observable, take } from 'rxjs';
import { LocalStorageService } from '../data-services/local-storage/local-storage.service';
import { AssetsService } from '../data-services/services/assets.service';
import { db } from '../data-services/indexed-db/db';
import { ElectronService } from '../data-services/electron/electron.service';
import { DecksService } from '../data-services/services/decks.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardsService } from '../data-services/services/cards.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  providers: [ConfirmationService]
})
export class WelcomeComponent implements OnInit {
  public displayLoading: boolean = false;
  public loadingIndeterminate: boolean = false;
  public loadingPercent: number = 0;
  public loadingInfo: string = '';
  public loadingHeader: string = '';

  recentProjectUrls: { url: string; name: string; hue: number; hover: boolean}[] = [];

  constructor(private localStorageService: LocalStorageService,
    private confirmationService: ConfirmationService,
    private assetsService: AssetsService,
    private electronService: ElectronService,
    private decksService: DecksService,
    private cardTemplatesService: CardTemplatesService,
    private cardAttributesService: CardAttributesService,
    private cardsService: CardsService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.localStorageService.getRecentProjectUrls().pipe(take(1)).subscribe(urls => {
      this.recentProjectUrls = urls.map(url => {
        let name = url.substring(url.lastIndexOf('/') + 1 | 0);
        return {
          url: url,
          name: name,
          hue: this.calculateHue(name),
          hover: false
        }
      });
    });

    // const sampleUrls = ['apple-cider-game', 'not-a-fun-game', 
    //   'what-a-wonderful-world', 'snakes-and-rakes', 'a'];
    // Promise.resolve(sampleUrls).then(urls => {
    //   this.recentProjectUrls = urls.map(url => {
    //     let name = url.substring(url.lastIndexOf('/') + 1 | 0);
    //     return {
    //       url: url,
    //       name: name,
    //       hue: this.calculateHue(name),
    //       hover: false
    //     }
    //   });
    // });
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

  public openProject(url: string) {
    this.confirmationService.confirm({
      message: 'Are you sure that you wish to open another project?'
        + ' All unsaved data will be lost.',
      header: 'Open Project',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.electronService.selectDirectory(url);
        this.localStorageService.addRecentProjectUrl(url);
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
