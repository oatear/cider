import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { CardsComponent } from './cards/cards.component';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { DeckGuard } from './shared/guards/deck.guard';
import { DecksComponent } from './decks/decks.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProjectGuard } from './shared/guards/project.guard';
import { AssetComponent } from './asset/asset.component';
import { AssetGeneratorComponent } from './asset-generator/asset-generator.component';
import { DocumentComponent } from './document/document.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProjectComponent } from './project/project.component';
import { GameSimulatorComponent } from './game-simulator/game-simulator.component';
import { TemplateGeneratorComponent } from './template-generator/template-generator.component';

const routes: Routes = [
  { path: 'decks', component: DecksComponent, canActivate: [ProjectGuard]},
  { path: 'assets', component: AssetsComponent, canActivate: [ProjectGuard]},
  { path: 'assets/generator', component: AssetGeneratorComponent, canActivate: [ProjectGuard]},
  { path: 'assets/:assetId', component: AssetComponent, canActivate: [ProjectGuard]},
  { path: 'documents', component: DocumentsComponent, canActivate: [ProjectGuard]},
  { path: 'documents/:documentId', component: DocumentComponent, canActivate: [ProjectGuard]},
  { path: 'decks/:deckId', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/listing', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/attributes', component: CardAttributesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/templates/generator', component: TemplateGeneratorComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/templates/:templateId', component: CardTemplatesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/export-cards', component: ExportCardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'project', component: ProjectComponent, canActivate: [ProjectGuard]},
  { path: 'simulator', component: GameSimulatorComponent, canActivate: [ProjectGuard]},
  { path: '**', component: WelcomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
