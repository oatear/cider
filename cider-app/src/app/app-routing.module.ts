import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { CardsComponent } from './cards/cards.component';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { DeckGuard } from './deck.guard';
import { DecksComponent } from './decks/decks.component';

const routes: Routes = [
  { path: 'decks', component: DecksComponent},
  { path: 'assets', component: AssetsComponent},
  { path: 'decks/:deckId/cards', component: CardsComponent, canActivate: [DeckGuard]},
  { path: 'decks/:deckId/cards/listing', component: CardsComponent, canActivate: [DeckGuard]},
  { path: 'decks/:deckId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [DeckGuard]},
  { path: 'decks/:deckId/cards/attributes', component: CardAttributesComponent, canActivate: [DeckGuard]},
  { path: 'decks/:deckId/card-templates', component: CardTemplatesComponent, canActivate: [DeckGuard]},
  { path: 'decks/:deckId/export-cards', component: ExportCardsComponent, canActivate: [DeckGuard]},
  { path: '**', component: DecksComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
