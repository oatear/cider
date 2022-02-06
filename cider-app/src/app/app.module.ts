import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GamesComponent } from './games/games.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { PrintTemplatesComponent } from './print-templates/print-templates.component';
import { CardsComponent } from './cards/cards.component';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenubarModule } from 'primeng/menubar';

import { SiteHeaderComponent } from './site-header/site-header.component';
import { SiteFooterComponent } from './site-footer/site-footer.component';
import { SiteContentComponent } from './site-content/site-content.component';
import { SiteContentAndMenuComponent } from './site-content-and-menu/site-content-and-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    GamesComponent,
    CardTemplatesComponent,
    PrintTemplatesComponent,
    CardsComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
    SiteContentComponent,
    SiteContentAndMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ButtonModule,
    RippleModule,
    CardModule,
    TableModule,
    PanelMenuModule,
    MenubarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
