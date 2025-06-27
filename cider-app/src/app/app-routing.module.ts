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

const routes: Routes = [
  { path: 'decks', component: DecksComponent, canActivate: [ProjectGuard]},
  { path: 'assets', component: AssetsComponent, canActivate: [ProjectGuard]},
  { path: 'assets/:assetId', component: AssetComponent, canActivate: [ProjectGuard]},
  { path: 'decks/:deckId', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/listing', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/attributes', component: CardAttributesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/templates/:templateId', component: CardTemplatesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/export-cards', component: ExportCardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: '**', component: WelcomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
