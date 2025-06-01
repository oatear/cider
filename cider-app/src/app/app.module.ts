import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
import { TextareaModule } from 'primeng/textarea';
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
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { MultiSelectModule } from 'primeng/multiselect';
import { DataViewModule } from 'primeng/dataview';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { SiteHeaderComponent } from './site-header/site-header.component';
import { SiteFooterComponent } from './site-footer/site-footer.component';
import { SiteContentComponent } from './site-content/site-content.component';
import { SiteTemplateComponent } from './site-template/site-template.component';
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
import { WelcomeComponent } from './welcome/welcome.component';
import { ExportSelectionDialogComponent } from './export-selection-dialog/export-selection-dialog.component';
import { CardToHtmlPipe } from './shared/pipes/template-to-html.pipe';
import MonacoExtension from './shared/extensions/monaco-extension';
import { SiteMenuComponent } from './site-menu/site-menu.component';
import { SiteSidebarComponent } from './site-sidebar/site-sidebar.component';
import { providePrimeNG } from 'primeng/config';
import { CiderTheme } from './cider-theme';
import { SiteActivitybarComponent } from './site-activitybar/site-activitybar.component';

@NgModule({ declarations: [
        AppComponent,
        DecksComponent,
        CardTemplatesComponent,
        CardsComponent,
        SiteHeaderComponent,
        SiteFooterComponent,
        SiteContentComponent,
        SiteTemplateComponent,
        AssetsComponent,
        EntityTableComponent,
        EntityDialogComponent,
        CardPreviewComponent,
        ExportCardsComponent,
        CardsTabMenuComponent,
        CardAttributesComponent,
        CardThumbnailsComponent,
        PageHeaderComponent,
        WelcomeComponent,
        ExportSelectionDialogComponent,
        SiteMenuComponent,
        SiteSidebarComponent,
        SiteActivitybarComponent
    ],
    bootstrap: [AppComponent], 
    imports: [BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MonacoEditorModule.forRoot(MonacoExtension.monacoConfig),
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
        TextareaModule,
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
        ChipModule,
        DividerModule,
        MultiSelectModule,
        DataViewModule,
        TreeModule,
        TooltipModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
    ], 
    providers: [
        CardToHtmlPipe, provideHttpClient(withInterceptorsFromDi()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: CiderTheme
            }
        })
    ]})
export class AppModule { }

