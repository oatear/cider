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
import { WelcomeComponent } from './welcome/welcome.component';
import { ProjectGuard } from './project.guard';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent},
  { path: 'decks', component: DecksComponent, canActivate: [ProjectGuard]},
  { path: 'assets', component: AssetsComponent, canActivate: [ProjectGuard]},
  { path: 'decks/:deckId/cards', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/listing', component: CardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/cards/attributes', component: CardAttributesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/card-templates', component: CardTemplatesComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: 'decks/:deckId/export-cards', component: ExportCardsComponent, canActivate: [ProjectGuard, DeckGuard]},
  { path: '**', component: DecksComponent, canActivate: [ProjectGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
