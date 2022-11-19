import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DecksComponent } from './decks/decks.component';
import { CardTemplatesComponent } from './card-templates/card-templates.component';
import { CardsComponent } from './cards/cards.component';

import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SplitterModule } from 'primeng/splitter';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressBarModule } from 'primeng/progressbar';
import { CheckboxModule } from 'primeng/checkbox';
import { TabMenuModule } from 'primeng/tabmenu';
import { ChipsModule } from 'primeng/chips';

import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

import { SiteHeaderComponent } from './site-header/site-header.component';
import { SiteFooterComponent } from './site-footer/site-footer.component';
import { SiteContentComponent } from './site-content/site-content.component';
import { SiteContentAndMenuComponent } from './site-content-and-menu/site-content-and-menu.component';
import { AssetsComponent } from './assets/assets.component';
import { EntityTableComponent } from './entity-table/entity-table.component';
import { EntityDialogComponent } from './entity-dialog/entity-dialog.component';
import { DataServicesModule } from './data-services/data-services.module';
import { CardPreviewComponent } from './card-preview/card-preview.component';
import { SharedModule } from './shared/shared.module';
import { ExportCardsComponent } from './export-cards/export-cards.component';
import { CardsTabMenuComponent } from './cards-tab-menu/cards-tab-menu.component';
import { CardAttributesComponent } from './card-attributes/card-attributes.component';
import { CardThumbnailsComponent } from './card-thumbnails/card-thumbnails.component';
import { PageHeaderComponent } from './page-header/page-header.component';

@NgModule({
  declarations: [
    AppComponent,
    DecksComponent,
    CardTemplatesComponent,
    CardsComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
    SiteContentComponent,
    SiteContentAndMenuComponent,
    AssetsComponent,
    EntityTableComponent,
    EntityDialogComponent,
    CardPreviewComponent,
    ExportCardsComponent,
    CardsTabMenuComponent,
    CardAttributesComponent,
    CardThumbnailsComponent,
    PageHeaderComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MonacoEditorModule,
    ButtonModule,
    RippleModule,
    CardModule,
    TableModule,
    PanelModule,
    PanelMenuModule,
    MenubarModule,
    ToolbarModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    SplitterModule,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule,
    TabViewModule,
    DataServicesModule,
    SharedModule,
    ScrollPanelModule,
    FileUploadModule,
    MessageModule,
    SelectButtonModule,
    ProgressBarModule,
    CheckboxModule,
    TabMenuModule,
    ChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
