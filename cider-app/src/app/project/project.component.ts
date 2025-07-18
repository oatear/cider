import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../data-services/electron/electron.service';
import { DecksService } from '../data-services/services/decks.service';
import { AssetsService } from '../data-services/services/assets.service';
import { DocumentsService } from '../data-services/services/documents.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface ProjectInfo {
  name: string;
  assetCount: number;
  documentCount: number;
  deckCount: number;
  cardCount: number;
  templateCount: number;
  attributeCount: number;
}

interface DeckInfo {
  id: number;
  name: string;
  cardCount: number;
  templateCount: number;
  attributeCount: number;
  meters: Meter[];
}

interface Meter {
  label: string;
  value: number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {
  projectName: string = 'Cider Project';
  projectInfo: ProjectInfo | undefined;
  deckInfos: DeckInfo[] = [];
  projectMeters: Meter[] = [];

  constructor(private electronService: ElectronService,
    private assetsService: AssetsService,
    private documentsService: DocumentsService,
    private decksService: DecksService,
    private cardsService: CardsService,
    private cardTemplatesService: CardTemplatesService,
    private attributesService: CardAttributesService,
    private router: Router,
  ) {
    // do nothing here, we will load the project info in ngOnInit
  }

  ngOnInit(): void {
    this.getProjectInfo().then(info => {
      this.projectInfo = info;
      this.projectName = info.name;
      this.updateProjectMeters();
    });
    this.getDeckInfos().then(decks => {
      this.deckInfos = decks;
    });
  }

  private updateProjectMeters(): void {
    if (!this.projectInfo) {
      return;
    }
    this.projectMeters = [
      {
        label: 'Assets',
        value: this.projectInfo.assetCount,
        icon: 'pi pi-image',
        color: '#4db6ac'
      },
      {
        label: 'Documents',
        value: this.projectInfo.documentCount,
        icon: 'pi pi-file',
        color: '#42a5f5'
      },
      {
        label: 'Decks',
        value: this.projectInfo.deckCount,
        icon: 'pi pi-folder',
        color: 'grey'
      },
      {
        label: 'Cards',
        value: this.projectInfo.cardCount,
        icon: 'pi pi-list',
        color: '#7986cb'
      },
      {
        label: 'Templates',
        value: this.projectInfo.templateCount,
        icon: 'pi pi-id-card',
        color: '#ae80ff'
      },
      {
        label: 'Attributes',
        value: this.projectInfo.attributeCount,
        icon: 'pi pi-tags',
        color: '#ffb74d'
      }
    ];
  }

  private getProjectName(): Promise<string> {
    if (this.electronService.isElectron()) {
      return firstValueFrom(this.electronService.getProjectHomeUrl())
        .then(homeUrl => homeUrl?.split('/').pop() || 'Cider Project');
    }
    return new Promise((resolve, reject) => resolve('Cider Project'));
  }

  private async getProjectInfo(): Promise<ProjectInfo> {
    const projectName = await this.getProjectName();
    const assets = await this.assetsService.getAll()
    const documents = await this.documentsService.getAll();
    const decks = await this.decksService.getAll();
    const cards = await this.cardsService.getAllUnfiltered();
    const templates = await this.cardTemplatesService.getAllUnfiltered();
    const attributes = await this.attributesService.getAllUnfiltered();
    
    return {
      name: projectName,
      assetCount: assets.length,
      documentCount: documents.length,
      deckCount: decks.length,
      cardCount: cards.length,
      templateCount: templates.length,
      attributeCount: attributes.length,
    };
  }

  private async getDeckInfos(): Promise<DeckInfo[]> {
    const decks = await this.decksService.getAll();
    const deckInfos: DeckInfo[] = [];
    
    for (const deck of decks) {
      const cards = await this.cardsService.getAll({ deckId: deck.id });
      const templates = await this.cardTemplatesService.getAll({ deckId: deck.id });
      const attributes = await this.attributesService.getAll({ deckId: deck.id });
      const meters: Meter[] = [
        {
          label: 'Cards',
          value: cards.length,
          icon: 'pi pi-list',
          color: '#7986cb'
        },
        {
          label: 'Templates',
          value: templates.length,
          icon: 'pi pi-id-card',
          color: '#ae80ff'
        },
        {
          label: 'Attributes',
          value: attributes.length,
          icon: 'pi pi-tags',
          color: '#ffb74d'
        }
      ];
      
      deckInfos.push({
        id: deck.id,
        name: deck.name,
        cardCount: cards.length,
        templateCount: templates.length,
        attributeCount: attributes.length,
        meters: meters
      });
    }
    
    return deckInfos;
  }

  public openDeck(deckId: number): void {
    this.router.navigate(['/decks', deckId]);
  }

}
