import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardsComponent } from './cards/cards.component';
import { GamesComponent } from './games/games.component';
import { PrintTemplatesComponent } from './print-templates/print-templates.component';

const routes: Routes = [
  { path: 'games', component: GamesComponent},
  { path: 'games/:gameId/cards', component: CardsComponent},
  { path: 'games/:gameId/card-templates', component: CardTemplatesComponent},
  { path: 'games/:gameId/print-templates', component: PrintTemplatesComponent},
  { path: 'games/:gameId/assets', component: AssetsComponent},
  { path: '**', component: GamesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
