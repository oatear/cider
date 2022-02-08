import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

import { SiteHeaderComponent } from './site-header/site-header.component';
import { SiteFooterComponent } from './site-footer/site-footer.component';
import { SiteContentComponent } from './site-content/site-content.component';
import { SiteContentAndMenuComponent } from './site-content-and-menu/site-content-and-menu.component';
import { AssetsComponent } from './assets/assets.component';
import { EntityTableComponent } from './entity-table/entity-table.component';
import { EntityDialogComponent } from './entity-dialog/entity-dialog.component';

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
    SiteContentAndMenuComponent,
    AssetsComponent,
    EntityTableComponent,
    EntityDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ButtonModule,
    RippleModule,
    CardModule,
    TableModule,
    PanelMenuModule,
    MenubarModule,
    ToolbarModule,
    DialogModule,
    FormsModule,
    InputTextModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }