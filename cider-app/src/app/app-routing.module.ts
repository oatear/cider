import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { CardsComponent } from './cards/cards.component';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { GameGuard } from './game.guard';
import { GamesComponent } from './games/games.component';

const routes: Routes = [
  { path: 'games', component: GamesComponent},
  { path: 'games/:gameId/cards', component: CardsComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/cards/listing', component: CardsComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/cards/thumbnails', component: CardThumbnailsComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/cards/attributes', component: CardAttributesComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/card-templates', component: CardTemplatesComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/assets', component: AssetsComponent, canActivate: [GameGuard]},
  { path: 'games/:gameId/export-cards', component: ExportCardsComponent, canActivate: [GameGuard]},
  { path: '**', component: GamesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
